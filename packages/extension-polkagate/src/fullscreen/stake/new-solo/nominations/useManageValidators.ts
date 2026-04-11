// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react';
import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { useCallback, useMemo, useState } from 'react';

import { createSelectionPrioritySorter, DEFAULT_VALIDATORS_PER_PAGE, getFilterValidators, getSortAndFilterValidators, isIncluded, mergeValidatorsByAccountId, VALIDATORS_SORTED_BY } from './util';

interface UseManageValidatorsInput {
  maximum: number;
  nominatedValidatorsInformation: ValidatorInformation[] | undefined;
  selectedBestValidators: ValidatorInformation[] | null |undefined;
  validatorsInformation: ValidatorInformation[] | undefined;
}

interface UseManageValidatorsOutput {
  isAlreadySelected: (validator: ValidatorInformation) => boolean;
  isLoaded: boolean;
  isNextDisabled: boolean;
  isSelected: (validator: ValidatorInformation) => boolean;
  itemsPerPage: string | number;
  itemsToShow: ValidatorInformation[] | undefined;
  newSelectedValidators: ValidatorInformation[];
  onReset: () => void;
  onSearch: (input: string) => void;
  onSelect: (validator: ValidatorInformation) => () => void;
  onSortChange: (sortBy: string) => void;
  onSystemSuggestion: () => void;
  page: number;
  reachedMaximum: boolean;
  setItemsPerPagePage: Dispatch<SetStateAction<string | number>>;
  setPage: Dispatch<SetStateAction<number>>;
  sortConfig: string;
  sortedValidatorsInformation: ValidatorInformation[] | undefined;
  systemSuggestion: boolean;
}

export default function useManageValidators({ maximum,
  nominatedValidatorsInformation,
  selectedBestValidators,
  validatorsInformation }: UseManageValidatorsInput): UseManageValidatorsOutput {
  const [systemSuggestion, setSystemSuggestion] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = useState<string>('');
  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInformation[]>([]);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPagePage] = useState<string | number>(DEFAULT_VALIDATORS_PER_PAGE);

  const newSelectedIds = useMemo(() => new Set(newSelectedValidators.map(({ accountId }) => String(accountId))), [newSelectedValidators]);
  const nominatedIds = useMemo(() => new Set(nominatedValidatorsInformation?.map(({ accountId }) => String(accountId)) ?? []), [nominatedValidatorsInformation]);

  const displayValidatorsInformation = useMemo(() => {
    if (!validatorsInformation || !nominatedValidatorsInformation) {
      return undefined;
    }

    return mergeValidatorsByAccountId(nominatedValidatorsInformation, validatorsInformation);
  }, [nominatedValidatorsInformation, validatorsInformation]);

  const sortedValidatorsInformation = useMemo(() => {
    if (!displayValidatorsInformation || !nominatedValidatorsInformation) {
      return undefined;
    }

    const filteredValidators = getFilterValidators(displayValidatorsInformation, search);
    const sortedAndFilteredValidators = getSortAndFilterValidators(filteredValidators, sortConfig);

    if (sortConfig === VALIDATORS_SORTED_BY.DEFAULT.toString() || systemSuggestion) {
      const compareBySelectionPriority = createSelectionPrioritySorter(newSelectedIds, nominatedIds);

      return [...(sortedAndFilteredValidators ?? [])].sort((a, b) => compareBySelectionPriority(String(a.accountId), String(b.accountId)));
    }

    return sortedAndFilteredValidators;
  }, [displayValidatorsInformation, newSelectedIds, nominatedIds, nominatedValidatorsInformation, search, sortConfig, systemSuggestion]);

  const itemsToShow = useMemo(() => {
    if (!sortedValidatorsInformation) {
      return undefined;
    }

    const start = (page - 1) * Number(itemsPerPage);
    const end = start + Number(itemsPerPage);

    return sortedValidatorsInformation.slice(start, end);
  }, [itemsPerPage, page, sortedValidatorsInformation]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
    setPage(1);
  }, []);

  const onSortChange = useCallback((sortBy: string) => {
    setSortConfig(sortBy);
    setPage(1);
  }, []);

  const onSystemSuggestion = useCallback(() => {
    const isChecked = !systemSuggestion;

    onSearch('');
    setSystemSuggestion(isChecked);
    setNewSelectedValidators(isChecked ? [...(selectedBestValidators ?? [])] : []);
  }, [onSearch, selectedBestValidators, systemSuggestion]);

  const isSelected = useCallback((validator: ValidatorInformation) => isIncluded(validator, newSelectedValidators), [newSelectedValidators]);
  const isAlreadySelected = useCallback((validator: ValidatorInformation) => isIncluded(validator, nominatedValidatorsInformation), [nominatedValidatorsInformation]);
  const reachedMaximum = useMemo(() => newSelectedValidators.length >= maximum, [maximum, newSelectedValidators.length]);

  const onSelect = useCallback((validator: ValidatorInformation) => () => {
    setNewSelectedValidators((prev) => {
      const current = prev || [];
      const validatorId = String(validator.accountId);
      const existingIndex = current.findIndex(({ accountId }) => String(accountId) === validatorId);

      if (existingIndex >= 0) {
        const newArray = [...current];

        newArray.splice(existingIndex, 1);

        return newArray;
      }

      if (current.length >= maximum) {
        return prev;
      }

      return [...current, validator];
    });
  }, [maximum]);

  const onReset = useCallback(() => {
    setNewSelectedValidators([]);
    setSystemSuggestion(false);
  }, []);

  const isLoaded = useMemo(() => Boolean(itemsToShow?.length), [itemsToShow]);

  const isNextDisabled = useMemo(() => {
    if (!isLoaded || newSelectedIds.size === 0) {
      return true;
    }

    const isExactMatch =
      newSelectedIds.size === nominatedIds.size &&
      [...nominatedIds].every((id) => newSelectedIds.has(id));

    return isExactMatch;
  }, [isLoaded, newSelectedIds, nominatedIds]);

  return {
    isAlreadySelected,
    isLoaded,
    isNextDisabled,
    isSelected,
    itemsPerPage,
    itemsToShow,
    newSelectedValidators,
    onReset,
    onSearch,
    onSelect,
    onSortChange,
    onSystemSuggestion,
    page,
    reachedMaximum,
    setItemsPerPagePage,
    setPage,
    sortConfig,
    sortedValidatorsInformation,
    systemSuggestion
  };
}
