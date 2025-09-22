// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import type { SoloStakingInfo } from '@polkadot/extension-polkagate/hooks/useSoloStakingInfo';
import type { ValidatorInformation, ValidatorsInformation } from '@polkadot/extension-polkagate/hooks/useValidatorsInformation';
import type { Option, u32, Vec } from '@polkadot/types';
import type { AccountId, ValidatorPrefs } from '@polkadot/types/interfaces';
import type { PalletStakingRewardDestination, PalletStakingStakingLedger, SpStakingExposure, SpStakingExposurePage, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';

export const DEFAULT_VALIDATORS_PER_PAGE = 8;
export const VALIDATORS_PAGINATION_OPTIONS = [
  { text: '8', value: 8 },
  { text: '10', value: 10 },
  { text: '20', value: 20 },
  { text: '50', value: 50 }
];

export enum VALIDATORS_SORTED_BY {
  DEFAULT = 'Default',
  MOST_STAKED = 'Most Staked',
  LEAST_COMMISSION = 'Least Commission',
  MOST_NOMINATORS = 'Most Nominators'
}

export const getFilterValidators = (validatorsInformation: ValidatorInformation[] | undefined, search: string) => {
  if (!validatorsInformation || search.trim() === '') {
    return validatorsInformation;
  }

  const searchLower = search.toLowerCase().trim();

  return validatorsInformation.filter((validator) => {
    // Search by account ID
    if (validator.accountId.toString().toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search by display name if available
    if (validator.identity?.display?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search by parent display name if available
    if (validator.identity?.displayParent?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search by judgements (like "Reasonable", "KnownGood", etc.)
    if (validator.identity?.judgements?.some(([, judgement]) =>
      judgement.toString().toLowerCase().includes(searchLower))) {
      return true;
    }

    return false;
  });
};

export const getSortAndFilterValidators = (validatorsInformation: ValidatorInformation[] | undefined, sortConfig: string) => {
  if (!validatorsInformation || sortConfig === VALIDATORS_SORTED_BY.DEFAULT.toString()) {
    return validatorsInformation;
  }

  const sorted = [...validatorsInformation].sort((a, b) => {
    switch (sortConfig) {
      case VALIDATORS_SORTED_BY.MOST_STAKED.toString(): {
        // Sort by total stake (assuming there's a totalStake property)
        const aStake = a.exposurePaged?.pageTotal || 0;
        const bStake = b.exposurePaged?.pageTotal || 0;

        return Number(bStake) - Number(aStake); // Descending order
      }

      case VALIDATORS_SORTED_BY.LEAST_COMMISSION.toString(): {
        // Sort by commission (ascending - least first)
        const aCommission = a.validatorPrefs?.commission || 0;
        const bCommission = b.validatorPrefs?.commission || 0;

        return Number(aCommission) - Number(bCommission); // Ascending order
      }

      case VALIDATORS_SORTED_BY.MOST_NOMINATORS.toString(): {
        // Sort by number of nominators (assuming there's a nominators property)
        const aNominators = a.exposureMeta?.nominatorCount || 0;
        const bNominators = b.exposureMeta?.nominatorCount || 0;

        return bNominators - aNominators; // Descending order
      }

      default:
        return 0;
    }
  });

  return sorted;
};

export const placeholderValidator: ValidatorInformation = {
  accountId: '' as unknown as AccountId,
  claimedRewardsEras: [] as unknown as Vec<u32>,
  controllerId: '' as unknown as AccountId,
  exposureEraStakers: {} as unknown as SpStakingExposure,
  exposureMeta: {} as unknown as Option<SpStakingPagedExposureMetadata>,
  exposurePaged: {} as unknown as Option<SpStakingExposurePage>,
  identity: null,
  nominators: [],
  rewardDestination: {} as unknown as PalletStakingRewardDestination,
  stakingLedger: {} as unknown as PalletStakingStakingLedger,
  stashId: '' as unknown as AccountId,
  validatorPrefs: {} as unknown as ValidatorPrefs
};

export const getNominatedValidatorsIds = (stakingInfo: SoloStakingInfo | undefined) =>
  stakingInfo?.stakingAccount === null || stakingInfo?.stakingAccount?.nominators?.length === 0
    ? null
    : stakingInfo?.stakingAccount?.nominators.map((item) => item.toString());

export const getNominatedValidatorsInformation = (validatorsInfo: ValidatorsInformation | undefined, nominatedValidatorsIds: string[] | null | undefined) => {
  if (!validatorsInfo || !nominatedValidatorsIds) {
    return undefined;
  }

  const allValidators = [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting];
  const result = [];

  // Go through each nominated validator ID
  for (const nominatedId of nominatedValidatorsIds) {
    // Try to find the validator in the existing data
    const existingValidator = allValidators.find(({ accountId }) => String(accountId) === nominatedId);

    if (existingValidator) {
      // If found, use the existing validator info
      result.push(existingValidator);
    } else {
      // If not found, create a placeholder validator object
      result.push({
        ...placeholderValidator,
        accountId: nominatedId as unknown as AccountId
      });
    }
  }

  return result;
};

export const isIncluded = (validator: ValidatorInformation, validatorArray: ValidatorInformation[] | undefined) =>
  Boolean(validatorArray?.find(({ accountId }) => accountId.toString() === validator.accountId.toString()));

export const onSort = (aId: string, bId: string, newSelectedValidators: ValidatorInformation[], nominatedValidatorsInformation: ValidatorInformation[]) => {
  const newSelectedIds = new Set(newSelectedValidators.map(({ accountId }) => String(accountId)));
  const nominatedIds = new Set(nominatedValidatorsInformation.map(({ accountId }) => String(accountId)));

  const aNewSelected = newSelectedIds.has(aId);
  const bNewSelected = newSelectedIds.has(bId);
  const aNominated = nominatedIds.has(aId);
  const bNominated = nominatedIds.has(bId);

  // Priority: new selected > nominated > others
  if (aNewSelected && !bNewSelected) {
    return -1;
  }

  if (!aNewSelected && bNewSelected) {
    return 1;
  }

  if (aNominated && !bNominated && !bNewSelected) {
    return -1;
  }

  if (!aNominated && bNominated && !aNewSelected) {
    return 1;
  }

  return 0;
};
