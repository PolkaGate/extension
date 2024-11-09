// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option, u128 } from '@polkadot/types';
//@ts-ignore
import type { PalletStakingActiveEraInfo, PalletStakingEraRewardPoints, PalletStakingValidatorPrefs, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_HUNDRED, BN_ZERO } from '@polkadot/util';

interface ValidatorEraInfo {
  netReward: BN;
  total: BN;
}

export default function useValidatorApy (api: ApiPromise | undefined, validatorAddress: string, isElected?: boolean): string | undefined | null {
  const [apy, setApy] = useState<string | null>();

  const calculateValidatorAPY = useCallback(async (validatorAddress: string) => {
    if (!api) {
      return;
    }

    // Define the number of past eras you want to check (e.g., last 10 eras)
    const eraDepth = 10;
    const decimal = new BN(10 ** api.registry.chainDecimals[0]);
    let totalRewards = BN_ZERO;
    let totalPoints = BN_ZERO;
    let validatorPoints = BN_ZERO;
    let totalStaked = BN_ZERO;
    const validatorEraInfo: ValidatorEraInfo[] = [];

    const currentEra = ((await api.query['staking']['activeEra']()) as Option<PalletStakingActiveEraInfo>).unwrap().index.toNumber();
    const { commission } = await api.query['staking']['validators'](validatorAddress) as PalletStakingValidatorPrefs;

    // Loop over the past eras to calculate rewards for the validator
    for (let eraIndex = currentEra - eraDepth; eraIndex <= currentEra; eraIndex++) {
      let netReward;
      const eraReward = await api.query['staking']['erasValidatorReward'](eraIndex) as Option<u128>;

      if (eraReward.isNone) {
        continue;
      }

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

        netReward = _eraReward.mul(validatorPoints).div(totalPoints).muln(100 - (commission.toNumber() / 1e7)).div(BN_HUNDRED);
      } else {
        continue;
      }

      // Fetch the validator's stake in this era
      const validatorExposure = await api.query['staking']['erasStakersOverview'](eraIndex, validatorAddress) as Option<SpStakingPagedExposureMetadata>;

      if (validatorExposure.isSome) {
        const { total } = validatorExposure.unwrap();
        const totalAsBN = new BN(total.toString());

        if (totalAsBN.isZero()) {
          continue;
        }

        validatorEraInfo.push(
          {
            netReward,
            total: totalAsBN
          });
      }
    }

    if (!validatorEraInfo.length) {
      setApy(null);
    }

    validatorEraInfo.forEach(({ netReward, total }) => {
      totalRewards = totalRewards.add(netReward);
      totalStaked = totalStaked.add(total);
    });

    const actualDepth = validatorEraInfo.length;

    totalStaked = totalStaked.div(decimal).divn(actualDepth);

    const dailyReward = totalRewards.div(decimal).divn(actualDepth);

    // Calculate daily return as a fraction of the staked amount
    const dailyReturn = dailyReward.toNumber() / totalStaked.toNumber();

    const APY = (dailyReturn * 365 * 100).toFixed(2);

    if (!isFinite(+APY) || isNaN(+APY)) {
      setApy(null);
    }

    setApy(APY);
  }, [api]);

  useEffect(() => {
    if (!api || isElected === undefined) {
      return;
    }

    if (isElected === false) {
      return setApy(null);
    }

    calculateValidatorAPY(validatorAddress).catch(console.error);
  }, [api, calculateValidatorAPY, isElected, validatorAddress]);

  return apy;
}
