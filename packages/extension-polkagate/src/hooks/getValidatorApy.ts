// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Compact, Option, u128 } from '@polkadot/types';
import type { Perbill } from '@polkadot/types/interfaces';
//@ts-ignore
import type { PalletStakingEraRewardPoints } from '@polkadot/types/lookup';

import { BN, BN_HUNDRED, BN_ZERO } from '@polkadot/util';

export async function getValidatorApy (api: ApiPromise | undefined, validatorAddress: string, total: BN, commission: Compact<Perbill>, currentEra: number): Promise<string | null | undefined> {
  if (!api) {
    return;
  }

  // Define the number of past eras you want to check (e.g., last 10 eras)
  const eraDepth = 10;
  let depth = 0;
  let totalDepth = 0;
  const decimal = new BN(10 ** api.registry.chainDecimals[0]);
  let totalRewards = BN_ZERO;
  let totalPoints = BN_ZERO;
  let validatorPoints = BN_ZERO;
  let totalStaked = BN_ZERO;

  // Loop over the past eras to calculate rewards for the validator
  for (let eraIndex = currentEra - eraDepth; eraIndex < currentEra; eraIndex++) {
    const eraReward = await api.query['staking']['erasValidatorReward'](eraIndex) as Option<u128>;

    if (eraReward.isNone) {
      continue;
    }

    depth++;

    const eraPoints = await api.query['staking']['erasRewardPoints'](eraIndex) as PalletStakingEraRewardPoints;

    let validatorEraPoints;

    for (const [address, points] of eraPoints.individual.entries()) {
      if (address.toString() === validatorAddress) {
        validatorEraPoints = points;
        break;
      }
    }

    if (validatorEraPoints) {
      // Accumulate the validator's points and total points
      validatorPoints = validatorPoints.add(validatorEraPoints);
      totalPoints = totalPoints.add(eraPoints.total);
      const _eraReward = eraReward.unwrap();

      totalRewards = totalRewards.add(_eraReward.mul(validatorPoints).div(totalPoints).muln(100 - (commission.toNumber() / 1e7)).div(BN_HUNDRED));
    }

    const totalAsBN = new BN(total.toString());

    if (totalAsBN.isZero()) {
      continue;
    }

    totalDepth++;
    totalStaked = totalStaked.add(totalAsBN);
  }

  totalStaked = totalStaked.div(decimal).divn(totalDepth);
  const dailyReward = totalRewards.div(decimal).divn(depth);
  const dailyReturn = dailyReward.toNumber() / totalStaked.toNumber();

  const APY = (dailyReturn * 365 * 100).toFixed(2);

  return APY;
}
