// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId32 } from '@polkadot/types/interfaces';
// @ts-ignore
import type { SpStakingExposurePage } from '@polkadot/types/lookup';
import type { SoloStakingInfo } from '../../../../hooks/useSoloStakingInfo';

import React, { useMemo } from 'react';

import useNominatedValidatorsInfo from '@polkadot/extension-polkagate/src/hooks/useNominatedValidatorsInfo';

import { getFilterValidators, getSortAndFilterValidators, VALIDATORS_SORTED_BY } from './util';

export default function useNominatedValidatorsStatus (stakingInfo: SoloStakingInfo | undefined) {
  const [sortConfig, setSortConfig] = React.useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = React.useState<string>('');

  const { nominatedValidatorsInformation } = useNominatedValidatorsInfo(stakingInfo);

  const filteredValidators = useMemo(() => getFilterValidators(nominatedValidatorsInformation, search), [nominatedValidatorsInformation, search]);
  const sortedAndFilteredValidators = useMemo(() => getSortAndFilterValidators(filteredValidators, sortConfig), [filteredValidators, sortConfig]);

  const isNominated = useMemo(() => stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length > 0, [stakingInfo?.stakingAccount?.nominators]);
  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => sortedAndFilteredValidators && sortedAndFilteredValidators.length > 0, [sortedAndFilteredValidators]);

  const nominatedStatuses = useMemo(() => {
    const elected: typeof nominatedValidatorsInformation = [];
    const active: typeof nominatedValidatorsInformation = [];
    const nonElected: typeof nominatedValidatorsInformation = [];

    sortedAndFilteredValidators?.forEach((info) => {
      const others = (info.exposurePaged as unknown as SpStakingExposurePage | undefined)?.others;

      if (others?.length) {
        const isActive = others?.find(({ who }: { who: AccountId32 }) => who.toString() === stakingInfo?.stakingAccount?.accountId?.toString());

        isActive ? active.push(info) : elected.push(info);
      } else {
        nonElected.push(info);
      }
    });

    return { active, elected, nonElected };
  }, [sortedAndFilteredValidators, stakingInfo?.stakingAccount?.accountId]);

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
