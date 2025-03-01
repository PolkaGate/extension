// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option, u128 } from '@polkadot/types';
// @ts-ignore
import type { PalletStakingActiveEraInfo, PalletStakingEraRewardPoints, PalletStakingValidatorPrefs, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { calcInterval } from './useBlockInterval';

interface ValidatorEraInfo {
  netReward: number;
  total: BN;
}

export default function useValidatorApy(api: ApiPromise | undefined, validatorAddress: string, isElected?: boolean): string | undefined | null {
  const [apy, setApy] = useState<string | null>();
  const blockInterval = calcInterval(api);
  const blockIntervalInSec = blockInterval.toNumber() / 1000;

  const calculateValidatorAPY = useCallback(async (validatorAddress: string) => {
    if (!api) {
      return;
    }

    const decimal = new BN(10 ** api.registry.chainDecimals[0]);
    let totalRewards = 0;
    let totalPoints = BN_ZERO;
    let validatorPoints = BN_ZERO;
    let totalStaked = BN_ZERO;
    const validatorEraInfo: ValidatorEraInfo[] = [];

    const { eraLength } = await api.derive.session.progress();

    const currentEra = ((await api.query['staking']['activeEra']()) as Option<PalletStakingActiveEraInfo>).unwrap().index.toNumber();
    const { commission } = await api.query['staking']['validators'](validatorAddress) as PalletStakingValidatorPrefs;

    const eraLengthInHrs = eraLength.toNumber() * blockIntervalInSec / 3600; // 3600 = 1hr in seconds
    const eraPerDay = 24 / eraLengthInHrs;
    const eraDepth = 10 * eraPerDay; // eras to calculate

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

        netReward = _eraReward.toNumber() * (validatorPoints.toNumber() / totalPoints.toNumber()) * (100 - (commission.toNumber() / 1e7)) / 100;
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

      return;
    }

    validatorEraInfo.forEach(({ netReward, total }) => {
      totalRewards += netReward;
      totalStaked = totalStaked.add(total);
    });

    const actualDepth = validatorEraInfo.length;

    totalStaked = totalStaked.div(decimal).divn(actualDepth);

    const dailyReward = (totalRewards / decimal.toNumber() / actualDepth) * eraPerDay;
    const dailyReturn = dailyReward / totalStaked.toNumber();
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
