// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option, u32, Vec } from '@polkadot/types';
import type { AccountId, Perbill } from '@polkadot/types/interfaces';
// @ts-ignore
import type { PalletStakingEraRewardPoints, PalletStakingValidatorPrefs, SpStakingExposurePage, SpStakingIndividualExposure, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types-codec/types';

import { useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { mapHubToRelay } from '../util/migrateHubUtils';
import useChainInfo from './useChainInfo';
import { useActiveEraIndex, useFormatted } from '.';

export interface ValidatorDetailsType {
  commission: number;
  decimal: number;
  isValidator: boolean;
  isElected: boolean;
  isDisabled: boolean;
  nominators: SpStakingIndividualExposure[];
  rewardPoint: BN;
  token: string;
  nominatorCount: number;
  own: string;
  total: string;
}

export default function useValidatorDetails (address: string | undefined, genesisHash: string | undefined): ValidatorDetailsType | undefined {
  const { api, decimal, token } = useChainInfo(genesisHash);
  const relayGenesisHash = mapHubToRelay(genesisHash);
  const { api: relayChainApi } = useChainInfo(relayGenesisHash);
  const formatted = useFormatted(address, genesisHash);

  const activeEraIndex = useActiveEraIndex(genesisHash);
  const [validatorInfo, setValidatorInfo] = useState<ValidatorDetailsType>();

  useEffect(() => {
    if (!api || !formatted || !relayChainApi || !decimal || !token || !activeEraIndex) {
      return;
    }

    (async () => {
      const [elected, disabled, maybeOverview, intentions, rewardPoints, prefs] = await Promise.all([
        relayChainApi.query['session']['validators']() as unknown as Vec<AccountId>,
        relayChainApi.query['session']['disabledValidators']() as unknown as Vec<ITuple<[u32, Perbill]>>,
        api.query['staking']['erasStakersOverview'](activeEraIndex, address) as unknown as Option<SpStakingPagedExposureMetadata>,
        api.query['staking']['validators'].keys(),
        api.query['staking']['erasRewardPoints'](activeEraIndex) as unknown as PalletStakingEraRewardPoints,
        api.query['staking']['validators'](formatted) as unknown as PalletStakingValidatorPrefs
      ]);

      // Check if the given stashId is a validator
      const isValidator = intentions
        .map(({ args }: { args: any[] }) => args[0].toString())
        .includes(formatted);

      // If isActive = true
      //   If isDisabled = true → ❌ “This validator was offline and penalized this session.”
      //   Else → 🟢 “This validator is producing blocks normally.”
      // Else
      //   Ignore disabledValidators entirely

      const isElected = elected.some((v: AccountId) => v.toString() === formatted);
      const index = elected.findIndex((v: AccountId) => v.toString() === formatted);
      const isDisabled = disabled.some(([validatorIndex]: [u32, Perbill]) =>
        validatorIndex.toNumber() === index
      );

      const overview = maybeOverview.isSome
        ? maybeOverview.unwrap().toPrimitive() as { nominatorCount: number; pageCount: number; own: string; total: string; }
        : { nominatorCount: 0, own: '0', pageCount: 0, total: '0' };

        const pageCount = overview?.pageCount;

      const entries = Array.from(rewardPoints.individual.entries()) as [AccountId, u32][];

      const rewardPointEntry = entries.find(([accountId]) =>
        accountId.toString() === formatted
      );

      const rewardPoint = new BN(rewardPointEntry?.[1] ?? 0);

      const maybePages = await Promise.all(
        Array.from({ length: pageCount }).map((_, index) =>
          api.query['staking']['erasStakersPaged'](activeEraIndex, address, index) as unknown as Option<SpStakingExposurePage>
        )
      );

      const nominators: SpStakingIndividualExposure[] = maybePages.reduce((acc: SpStakingIndividualExposure[], maybePage) => {
        if (maybePage.isSome) {
          const page = maybePage.unwrap();

          if (page.others && Array.isArray(page.others)) {
            acc.push(...page.others);
          }
        }

        return acc;
      }, []);

      const commission = prefs.commission.toNumber() / 10_000_000;

      setValidatorInfo({
        commission,
        decimal,
        isDisabled,
        isElected,
        isValidator,
        rewardPoint,
        token,
        ...overview,
        nominators
      });
    })().catch(console.error);
  }, [address, api, activeEraIndex, decimal, formatted, relayChainApi, token]);

  return validatorInfo;
}
