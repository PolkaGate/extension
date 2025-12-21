// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option, StorageKey, u32, Vec } from '@polkadot/types';
import type { AccountId, Perbill } from '@polkadot/types/interfaces';
// @ts-ignore
import type { PalletStakingEraRewardPoints, PalletStakingValidatorPrefs, SpStakingExposurePage, SpStakingIndividualExposure, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import type { AnyTuple, ITuple } from '@polkadot/types-codec/types';

import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { mapHubToRelay } from '../util/migrateHubUtils';
import useChainInfo from './useChainInfo';
import { useActiveEraIndex, useFormatted, useValidatorApy } from '.';

export interface ValidatorDetailsType {
  APR?: string | null | undefined;
  commission: number;
  commissionHint: string;
  decimal: number;
  isValidator: boolean;
  isElected: boolean;
  isDisabled: boolean;
  nominators: SpStakingIndividualExposure[];
  rewardPoint: BN;
  rewardPointHint: string;
  token: string;
  nominatorCount: number;
  own: string;
  total: string;
}

function percentileFromIndex (index: number, total: number) {
  return index >= 0 && total ? ((index + 1) / total) * 100 : 0;
}

function getCommission (validatorPrefsEntries: [StorageKey<AnyTuple>, PalletStakingValidatorPrefs][], formattedId: AccountId): { commission: number; commissionHint: string; } {
  const normalizedCommissions = validatorPrefsEntries
    .map(([storageKey, prefs]) => ({
      accountId: storageKey.args[0],
      commission: prefs.commission.toNumber() / 10_000_000
    }))
    .sort((a, b) => a.commission - b.commission);

  const commissionIndex = normalizedCommissions.findIndex(
    ({ accountId }) => accountId.eq(formattedId)
  );

  const commission =
    commissionIndex >= 0
      ? normalizedCommissions[commissionIndex].commission
      : 0;

  const displayCommission = commission < 10e5 ? 0 : commission;

  let commissionHint = '';

  if (displayCommission) {
    const totalValidators = normalizedCommissions.length;
    const commissionPercentile = percentileFromIndex(commissionIndex, totalValidators);

    commissionHint = commissionPercentile >= 50
      ? `Higher than ${Math.round(commissionPercentile)}% of validators`
      : `Lower than ${Math.round(100 - commissionPercentile)}% of validators`;
  }

  return { commission: displayCommission, commissionHint };
}

function getRewardsPoints (rewardPoints: PalletStakingEraRewardPoints, formattedId: AccountId): { rewardPoint: BN; rewardPointHint: string; } {
  const entries = Array.from(rewardPoints.individual.entries()) as [AccountId, u32][];

  const normalizedRewardPoints = entries
    .map(([accountId, points]) => ({
      accountId,
      points: points.toNumber()
    }))
    .filter(({ points }) => points > 0)
    .sort((a, b) => a.points - b.points);

  const rewardPointIndex = normalizedRewardPoints.findIndex(
    ({ accountId }) => accountId.eq(formattedId)
  );

  const rewardPoint =
    rewardPointIndex >= 0
      ? new BN(normalizedRewardPoints[rewardPointIndex].points)
      : BN_ZERO;

  let rewardPointHint = '';

  if (!rewardPoint.isZero()) {
    const rpCount = normalizedRewardPoints.length;
    const rewardPointPercentile = percentileFromIndex(rewardPointIndex, rpCount);

    rewardPointHint = rewardPointPercentile >= 50
      ? `Higher than ${Math.round(rewardPointPercentile)}% of validators this era`
      : `Lower than ${Math.round(100 - rewardPointPercentile)}% of validators this era`;
  }

  return { rewardPoint, rewardPointHint };
}

async function getNominators (activeEraIndex: number, address: string, api: ApiPromise, overview: { nominatorCount: number; pageCount: number; own: string; total: string; }): Promise<SpStakingIndividualExposure[]> {
  const pageCount = overview?.pageCount;
  const maybePages = pageCount
    ? await Promise.all(
      Array.from({ length: pageCount }).map((_, index) =>
        api.query['staking']['erasStakersPaged'](activeEraIndex, address, index) as unknown as Option<SpStakingExposurePage>
      )
    )
    : [];

  return maybePages.reduce((acc: SpStakingIndividualExposure[], maybePage) => {
    if (maybePage.isSome) {
      const page = maybePage.unwrap();

      if (page.others && Array.isArray(page.others)) {
        acc.push(...page.others);
      }
    }

    return acc;
  }, []);
}

async function fetchValidatorContext (activeEraIndex: number, address: string, api: ApiPromise, rcApi: ApiPromise) {
  return await Promise.all([
    rcApi.query['session']['validators']() as unknown as Vec<AccountId>,
    rcApi.query['session']['disabledValidators']() as unknown as Vec<ITuple<[u32, Perbill]>>,
    api.query['staking']['erasStakersOverview'](activeEraIndex, address) as unknown as Option<SpStakingPagedExposureMetadata>,
    api.query['staking']['validators'].keys(),
    api.query['staking']['erasRewardPoints'](activeEraIndex) as unknown as PalletStakingEraRewardPoints,
    api.query['staking']['validators'].entries() as unknown as [StorageKey, PalletStakingValidatorPrefs][]
  ]);
}

export default function useValidatorDetails (address: string | undefined, genesisHash: string | undefined): ValidatorDetailsType | undefined {
  const { api, decimal, token } = useChainInfo(genesisHash);
  const rcGenesis = mapHubToRelay(genesisHash);
  const { api: rcApi } = useChainInfo(rcGenesis);
  const formatted = useFormatted(address, genesisHash);

  const activeEraIndex = useActiveEraIndex(genesisHash);
  const [validatorInfo, setValidatorInfo] = useState<ValidatorDetailsType>();
  const APR = useValidatorApy(api, formatted, validatorInfo?.isElected);

  useEffect(() => {
    if (!address || !api || !formatted || !rcApi || !decimal || !token || !activeEraIndex) {
      return;
    }

    const formattedId = api.createType('AccountId', formatted) as unknown as AccountId;

    (async () => {
      const [elected, disabled, maybeOverview, intentions, rewardPoints, validatorPrefsEntries] = await fetchValidatorContext(activeEraIndex, address, api, rcApi);

      const isValidator = !!intentions
        .find(({ args }: { args: any[] }) => (args[0] as AccountId).eq(formattedId));

      const validatorIndex = elected.findIndex((v: AccountId) => v.eq(formattedId));
      const isElected = validatorIndex !== -1;

      const isDisabled = isElected &&
        disabled.some(([index]: [u32, Perbill]) =>
          index.toNumber() === validatorIndex
        );

      const overview = maybeOverview.isSome
        ? maybeOverview.unwrap().toPrimitive() as { nominatorCount: number; pageCount: number; own: string; total: string; }
        : { nominatorCount: 0, own: '0', pageCount: 0, total: '0' };

      const nominators = overview.nominatorCount > 0
        ? await getNominators(activeEraIndex, address, api, overview)
        : [];

      const { rewardPoint, rewardPointHint } = isElected
        ? getRewardsPoints(rewardPoints, formattedId)
        : { rewardPoint: BN_ZERO, rewardPointHint: '' };

      const { commission, commissionHint } = isValidator
        ? getCommission(validatorPrefsEntries, formattedId)
        : { commission: 0, commissionHint: '' };

      setValidatorInfo({
        commission,
        commissionHint,
        decimal,
        isDisabled,
        isElected,
        isValidator,
        rewardPoint,
        rewardPointHint,
        token,
        ...overview,
        nominators
      });
    })().catch(console.error);
  }, [address, api, activeEraIndex, decimal, formatted, rcApi, token]);

  return validatorInfo
    ? {
      APR,
      ...validatorInfo
    }
    : undefined;
}
