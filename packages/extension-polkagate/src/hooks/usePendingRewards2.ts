// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec } from '@polkadot/types/types';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { toBN } from '../util/utils';
import { ExposureOverview, Others } from './useValidators';
import { useActiveEraIndex, useInfo } from '.';

export interface ExposureValue {
  others: Others[];
  own: BN;
  total: BN;
}

// Record<era, EraUnclaimedPayouts>
export interface Exposure {
  keys: [number, string];
  val: ExposureValue;
}

export interface ExposureInfo {
  exposedPage: number,
  myStaked: BN,
  total: BN,
  validatorAddress: string
}
export interface EraExposureInfo {
  eraIndex: number;
  exposureInfo: ExposureInfo[]
}
export interface EraValidaTorPair {
  eraIndex: number;
  validatorAddress: string
}

// Record<era, EraUnclaimedPayouts>
export type UnclaimedPayouts = Record<string, EraUnclaimedPayouts> | null;

// Record<validator, [page, amount]>
export type EraUnclaimedPayouts = Record<string, [number, BN]>;

export const PAGED_REWARD_START_ERA: Record<string, number> = {
  Kusama: 6514,
  Polkadot: 1420,
  Westend: 7167
};

export type AnyApi = any;
export type AnyJson = any;

const isRewardsPaged = (chainName: string | undefined, era: number): boolean => {
  if (!chainName) {
    return false;
  }

  const startEra = PAGED_REWARD_START_ERA[chainName];

  return startEra ? era >= startEra : false;
};

export const MAX_SUPPORTED_PAYOUT_ERAS = 7; // TODO: can increase to more if needed after enough tests

export default function usePendingRewards2(address: string): UnclaimedPayouts | undefined {
  const { api, chainName, formatted } = useInfo(address);
  const activeEra = useActiveEraIndex(address);
  const [pendingRewards, setPendingRewards] = useState<UnclaimedPayouts>();

  const endEra = activeEra ? activeEra - MAX_SUPPORTED_PAYOUT_ERAS - 1 : 1;

  const fetchEraExposure = useCallback(async (eraIndex: number): Promise<EraExposureInfo | null | undefined> => {
    if (!api) {
      return;
    }

    if (isRewardsPaged(chainName, eraIndex)) {
      const overview: [StorageKey<AnyTuple>, Codec][] = await api.query.staking.erasStakersOverview.entries(eraIndex);

      const validators = overview.reduce((prev: Record<string, Exposure>, [keys, value]) => {
        const validator = keys.toHuman()[1] as string;
        const { own, total } = value.unwrap() as ExposureOverview;

        return { ...prev, [validator]: { own: toBN(own), total: toBN(total) } };
      }, {});

      const validatorKeys = Object.keys(validators);

      const pagedResults: [StorageKey<AnyTuple>, Codec][][] = await Promise.all(
        validatorKeys.map((v) =>
          api.query.staking.erasStakersPaged.entries(eraIndex, v)
        )
      );

      const result: ExposureInfo[] = [];

      let i = 0;

      for (const pagedResult of pagedResults) {
        const validatorAddress = validatorKeys[i];

        pagedResult.forEach(([, v], index) => {
          const o = (v.unwrap()?.others || []) as Others[];

          const found = o.find(({ who }) => who.toString() === formatted);

          if (found) {
            const { value } = found;
            const { total } = validators[validatorAddress];

            return result.push({
              exposedPage: index,
              myStaked: toBN(value),
              total: toBN(total),
              validatorAddress
            });
          }
        });

        i++;
      }

      return result.length ? { eraIndex, exposureInfo: result } : null;
    }
    // ignore depreciated case
  }, [api, chainName, formatted]);

  const getAllExposures = useCallback(async () => {
    if (!api || !activeEra) {
      return;
    }

    let currentEra = activeEra - 1;
    const allExposures: EraExposureInfo[] = [];

    while (endEra < currentEra) {
      const eraExposureInfo = await fetchEraExposure(currentEra);

      if (eraExposureInfo) {
        allExposures.push(eraExposureInfo);
      }

      console.log('eraExposureInfo:', eraExposureInfo);
      window.dispatchEvent(new CustomEvent('percentOfErasCheckedForPendingRewards', { detail: (MAX_SUPPORTED_PAYOUT_ERAS - (currentEra - endEra) + 1) / MAX_SUPPORTED_PAYOUT_ERAS }));

      currentEra -= 1;
    }

    return allExposures;
  }, [activeEra, api, endEra, fetchEraExposure]);

  const getExposedPage = useCallback((_eraIndex, _validatorAddress, allExposures: EraExposureInfo[]): number | undefined => {
    const found = allExposures.find(({ eraIndex }) => eraIndex === _eraIndex);

    if (found) {
      const { exposureInfo } = found;

      return exposureInfo.find(({ validatorAddress }) => validatorAddress === _validatorAddress)?.exposedPage;
    }

    return undefined;
  }, []);

  const getEraExposure = useCallback((_eraIndex: number, _validatorAddress: string, allExposures: EraExposureInfo[]): ExposureInfo | null => {
    const found = allExposures.find(({ eraIndex }) => eraIndex === _eraIndex);

    if (found) {
      const { exposureInfo } = found;

      const foundInfo = exposureInfo.find(({ validatorAddress }) => validatorAddress === _validatorAddress);

      return foundInfo || null;
    }

    return null;
  }, []);

  const handleUnclaimedRewards = useCallback(async (allExposures: EraExposureInfo[]) => {
    if (!api) {
      return;
    }

    const eraValidatorsToCheck: EraValidaTorPair[] = [];

    allExposures.forEach((exposures) => {
      const { eraIndex, exposureInfo } = exposures;

      exposureInfo.forEach((info) => {
        const { validatorAddress } = info;

        eraValidatorsToCheck.push({ eraIndex, validatorAddress });
      });
    });

    // History of claimed paged rewards by era and validator.
    const claimedRewards = await Promise.all(
      eraValidatorsToCheck.map(({ eraIndex, validatorAddress }) =>
        api.query.staking.claimedRewards<AnyApi>(eraIndex, validatorAddress)
      )
    );

    // Unclaimed rewards by validator. Record<validator, eraIndex[]>
    const unclaimedRewards: Record<number, string[]> = {};

    for (let i = 0; i < claimedRewards.length; i++) {
      const pages = (claimedRewards[i].toHuman() || []) as string[];

      const { eraIndex, validatorAddress } = eraValidatorsToCheck[i];
      const exposedPage = getExposedPage(eraIndex, validatorAddress, allExposures);

      // if payout page has not yet been claimed
      if (!pages.includes(String(exposedPage))) {
        if (unclaimedRewards?.[eraIndex]) {
          unclaimedRewards[eraIndex].push(validatorAddress);
        } else {
          unclaimedRewards[eraIndex] = [validatorAddress];
        }
      }
    }

    // calls needed to calculate rewards.
    const calls: AnyApi[] = [];

    Object.entries(unclaimedRewards).forEach(([eraIndex, validators]) => {
      if (validators.length > 0) {
        calls.push(
          Promise.all([
            api.query.staking.erasValidatorReward<AnyApi>(eraIndex),
            api.query.staking.erasRewardPoints<AnyApi>(eraIndex),
            ...validators.map((validator: AnyJson) =>
              api.query.staking.erasValidatorPrefs<AnyApi>(eraIndex, validator)
            )
          ])
        );
      }
    });

    // determine unclaimed payouts Record<era, Record<validator, unclaimedPayout>>.
    const unclaimed: UnclaimedPayouts = {};
    let i = 0;

    for (const [eraTotalPayout, erasRewardPoints, ...prefs] of await Promise.all(calls)) {
      const eraIndex = Object.keys(unclaimedRewards)[i];
      const unclaimedValidators = unclaimedRewards[eraIndex];

      let j = 0;

      for (const eraValidatorPrefs of prefs) {
        const commission = toBN(eraValidatorPrefs.commission).divn(10 ** 7);
        const validator = (unclaimedValidators?.[j] || '') as string;
        const exposureInfo = getEraExposure(Number(eraIndex), validator, allExposures);
        const myStaked = exposureInfo?.myStaked || BN_ZERO;
        const total = exposureInfo?.total || BN_ZERO;
        const exposedPage = exposureInfo?.exposedPage || 0;
        const totalRewardPoints = erasRewardPoints.total;
        const validatorRewardPoints = new BN(erasRewardPoints.toHuman().individual?.[validator]?.replace(/,/g, '') || 0);
        const available = toBN(eraTotalPayout).mul(validatorRewardPoints).div(totalRewardPoints);
        const valCut = commission.mul(available).divn(100);

        const unclaimedPayout = total.isZero()
          ? BN_ZERO
          : available.sub(valCut).mul(myStaked).div(total);

        if (!unclaimedPayout.isZero()) {
          unclaimed[eraIndex] = {
            ...unclaimed[eraIndex],
            [validator]: [exposedPage, unclaimedPayout]
          };
          j++;
        }
      }

      i++;
    }

    setPendingRewards({ ...unclaimed });
  }, [api, getEraExposure, getExposedPage]);

  useEffect(() => {
    if (!activeEra || !formatted) {
      return;
    }

    getAllExposures().then((allExposures) => {
      allExposures?.length && handleUnclaimedRewards(allExposures);
    }).catch(console.error);
  }, [address, api, activeEra, formatted, getAllExposures, handleUnclaimedRewards]);

  return pendingRewards;
}
