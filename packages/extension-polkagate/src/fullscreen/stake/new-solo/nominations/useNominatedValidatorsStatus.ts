// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '@polkadot/extension-polkagate/hooks/useValidatorsInformation';
import type { AccountId32 } from '@polkadot/types/interfaces';
// @ts-expect-error lookup type import
import type { SpStakingExposurePage } from '@polkadot/types/lookup';
import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import React, { useMemo } from 'react';

import useNominatedValidatorsInfo from '@polkadot/extension-polkagate/src/hooks/useNominatedValidatorsInfo';

import { getFilterValidators, getSortAndFilterValidators, VALIDATORS_SORTED_BY } from './util';

export interface NominatedValidatorsStatus {
  active: ValidatorInformation[];
  elected: ValidatorInformation[];
  isLoaded: boolean | undefined;
  isLoading: boolean;
  isNominated: boolean | undefined;
  nonElected: ValidatorInformation[];
  retired: ValidatorInformation[];
  setSearch: (input: string) => void;
  setSortConfig: React.Dispatch<React.SetStateAction<string>>;
  sortConfig: string;
}

export default function useNominatedValidatorsStatus(stakingInfo: SoloStakingInfo | undefined): NominatedValidatorsStatus {
  const [sortConfig, setSortConfig] = React.useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = React.useState<string>('');

  const { nominatedValidatorsInformation, validatorsInfo } = useNominatedValidatorsInfo(stakingInfo);

  const filteredValidators = useMemo(() => getFilterValidators(nominatedValidatorsInformation, search), [nominatedValidatorsInformation, search]);
  const sortedAndFilteredValidators = useMemo(() => getSortAndFilterValidators(filteredValidators, sortConfig), [filteredValidators, sortConfig]);
  const electedIds = useMemo(
    () => new Set(validatorsInfo?.validatorsInformation.elected.map(({ accountId }) => String(accountId)) ?? []),
    [validatorsInfo?.validatorsInformation.elected]
  );

  const isNominated = useMemo(() => stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length > 0, [stakingInfo?.stakingAccount?.nominators]);
  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => sortedAndFilteredValidators !== undefined, [sortedAndFilteredValidators]);

  /** All known validator IDs (elected + waiting). Used to distinguish retired from non-elected. */
  const allValidatorIds = useMemo(
    () => new Set([
      ...(validatorsInfo?.validatorsInformation.elected.map(({ accountId }) => String(accountId)) ?? []),
      ...(validatorsInfo?.validatorsInformation.waiting.map(({ accountId }) => String(accountId)) ?? [])
    ]),
    [validatorsInfo?.validatorsInformation.elected, validatorsInfo?.validatorsInformation.waiting]
  );

  const nominatedStatuses = useMemo(() => {
    const elected: typeof nominatedValidatorsInformation = [];
    const active: typeof nominatedValidatorsInformation = [];
    const nonElected: typeof nominatedValidatorsInformation = [];
    const retired: typeof nominatedValidatorsInformation = [];

    sortedAndFilteredValidators?.forEach((info) => {
      const id = String(info.accountId);

      // A validator absent from both elected and waiting is retired.
      // We only classify as retired once validatorsInfo has loaded (allValidatorIds is non-empty
      // OR we have some validators info at all), to avoid false positives during initial load.
      if (validatorsInfo && !allValidatorIds.has(id)) {
        retired.push(info);

        return;
      }

      const isElected = electedIds.has(id);
      const others = (info.exposurePaged as unknown as SpStakingExposurePage | undefined)?.others;

      if (isElected) {
        const isActive = others?.find(({ who }: { who: AccountId32 }) => who.toString() === stakingInfo?.stakingAccount?.accountId?.toString());

        isActive ? active.push(info) : elected.push(info);
      } else {
        nonElected.push(info);
      }
    });

    return { active, elected, nonElected, retired };
  }, [allValidatorIds, electedIds, sortedAndFilteredValidators, stakingInfo?.stakingAccount?.accountId, validatorsInfo]);

  return {
    isLoaded,
    isLoading,
    isNominated,
    ...nominatedStatuses,
    setSearch,
    setSortConfig,
    sortConfig
  };
}
