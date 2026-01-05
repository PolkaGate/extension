// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Stack, Typography } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useNominatedValidatorsInfo from '@polkadot/extension-polkagate/src/hooks/useNominatedValidatorsInfo';

import PaginationRow from '../../../../fullscreen/history/PaginationRow';
import { useSoloStakingInfo, useStakingConsts, useTranslation, useValidatorSuggestion } from '../../../../hooks';
import VelvetBox from '../../../../style/VelvetBox';
import HomeLayout from '../../../components/layout';
import FooterControls from '../../partials/FooterControls';
import TableToolbar from '../../partials/TableToolbar';
import ReviewPopup from './ReviewPopup';
import SystemSuggestion from './SystemSuggestionButton';
import { DEFAULT_VALIDATORS_PER_PAGE, getFilterValidators, getSortAndFilterValidators, isIncluded, onSort, VALIDATORS_PAGINATION_OPTIONS, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem, ValidatorInfo } from './ValidatorItem';

function ManageValidators() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const stakingInfo = useSoloStakingInfo(address, genesisHash);
  const { nominatedValidatorsIds, nominatedValidatorsInformation, validatorsInfo, validatorsInformation } = useNominatedValidatorsInfo(stakingInfo);

  const selectedBestValidators = useValidatorSuggestion(validatorsInfo, genesisHash);
  const stakingConsts = useStakingConsts(genesisHash);

  const [review, setGoReview] = useState<boolean>(false);
  const [systemSuggestion, setSystemSuggestion] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = useState<string>('');
  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInformation[]>([]);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPagePage] = useState<string | number>(DEFAULT_VALIDATORS_PER_PAGE);

  const maximum = useMemo(() => stakingConsts?.maxNominations || 0, [stakingConsts?.maxNominations]);

  const sortedValidatorsInformation = useMemo(() => {
    if (!validatorsInformation || !nominatedValidatorsInformation) {
      return undefined;
    }

    const filteredValidators = getFilterValidators(validatorsInformation, search);
    const sortedAndFilteredValidators = getSortAndFilterValidators(filteredValidators, sortConfig);

    if (sortConfig === VALIDATORS_SORTED_BY.DEFAULT.toString() || systemSuggestion) {
      // Priority: new selected > nominated > others
      return sortedAndFilteredValidators?.sort((a, b) => onSort(String(a.accountId), String(b.accountId), newSelectedValidators, nominatedValidatorsInformation));
    }

    return sortedAndFilteredValidators;
  }, [validatorsInformation, nominatedValidatorsInformation, newSelectedValidators, search, sortConfig, systemSuggestion]);

  const itemsToShow = useMemo(() => {
    if (!sortedValidatorsInformation) {
      return undefined;
    }

    const start = (page - 1) * Number(itemsPerPage);
    const end = start + Number(itemsPerPage);

    return sortedValidatorsInformation.slice(start, end);
    // The systemSuggestion is here in order to sort happen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsPerPage, page, sortedValidatorsInformation, systemSuggestion]);

  const onSearch = useCallback((input: string) => {
    setSearch(input);
    setPage(1); // Reset to first page when searching
  }, []);

  const onSortChange = useCallback((sortBy: string) => {
    setSortConfig(sortBy);
    setPage(1); // Reset to first page when sorting changes
  }, []);

  const onSystemSuggestion = useCallback(() => {
    const isCheck = !systemSuggestion;

    onSearch('');
    setSystemSuggestion(isCheck);
    isCheck
      ? selectedBestValidators?.length && setNewSelectedValidators([...selectedBestValidators])
      : setNewSelectedValidators([]);
  }, [onSearch, selectedBestValidators, systemSuggestion]);

  const isSelected = useCallback((validator: ValidatorInformation) => isIncluded(validator, newSelectedValidators), [newSelectedValidators]);
  const isAlreadySelected = useCallback((validator: ValidatorInformation) => isIncluded(validator, nominatedValidatorsInformation), [nominatedValidatorsInformation]);
  // in order to prevent checkbox being checked!
  const reachedMaximum = useMemo(() => newSelectedValidators.length >= maximum, [maximum, newSelectedValidators.length]);

  const onSelect = useCallback((validator: ValidatorInformation) => () => {
    setNewSelectedValidators((prev) => {
      const current = prev || [];

      const validatorId = String(validator.accountId);
      const existingIndex = current.findIndex(({ accountId }) => String(accountId) === String(validatorId));

      if (existingIndex >= 0) {
        // Remove if exists
        const newArray = [...current];

        newArray.splice(existingIndex, 1);

        return newArray;
      } else {
        // check if the selection hit the maximum
        if (current.length >= maximum) {
          return prev;
        }

        // Add if doesn't exist
        return [...current, validator];
      }
    });
  }, [maximum]);
  const onReset = useCallback(() => {
    setNewSelectedValidators([]);
    setSystemSuggestion(false);
  }, []);
  const backToStakingHome = useCallback(() => navigate('/fullscreen-stake/solo/' + address + '/' + genesisHash) as void, [genesisHash, navigate, address]);
  const toggleReview = useCallback(() => setGoReview((isOnReview) => !isOnReview), []);

  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => itemsToShow && itemsToShow.length > 0, [itemsToShow]);

  const isNextDisabled = useMemo(() => {
    // If data is not yet loaded or no validators have been selected, disable the "Next" button
    if (!isLoaded || newSelectedValidators.length === 0) {
      return true;
    }

    // Convert both selected and nominated validator IDs to Sets for efficient comparison
    const selectedIds = new Set(newSelectedValidators.map(({ accountId }) => String(accountId)));
    const nominatedIds = new Set(nominatedValidatorsIds ?? []);

    // Check if both sets have the same size and contain the same elements
    const isExactMatch =
      selectedIds.size === nominatedIds.size &&
      [...nominatedIds].every((id) => selectedIds.has(id));

    // Enable the "Next" button only if there is a meaningful change in selection
    return isExactMatch;
  }, [isLoaded, newSelectedValidators, nominatedValidatorsIds]);

  return (
    <>
      <HomeLayout>
        <Stack direction='column' sx={{ alignItems: 'flex-start', px: '18px', width: '100%' }}>
          <Stack direction='column' sx={{ alignItems: 'flex-start', columnGap: '12px', pb: '26px', width: '100%' }}>
            <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-2'>
              {t('Edit Nominations')}
            </Typography>
            <Typography color='text.secondary' variant='B-4'>
              {t('Manage your nominated validators by considering their properties, including their commission rates. You can even filter them based on your preferences.')}
            </Typography>
          </Stack>
          <VelvetBox>
            <Stack direction='column' sx={{ width: '100%' }}>
              <TableToolbar
                onSearch={onSearch}
                setSortBy={onSortChange as React.Dispatch<React.SetStateAction<string>>}
                sortBy={sortConfig}
                sortByObject={VALIDATORS_SORTED_BY}
              >
                <SystemSuggestion
                  disabled={!isLoaded}
                  onSystemSuggestion={onSystemSuggestion}
                  systemSuggestion={systemSuggestion}
                />
              </TableToolbar>
              <Stack direction='column' sx={{ gap: '2px', height: 'calc(100vh - 390px)', overflow: 'auto', width: '100%' }}>
                {isLoaded &&
                  itemsToShow?.map((validator, index) => (
                    <ValidatorInfo
                      genesisHash={genesisHash}
                      isAlreadySelected={isAlreadySelected(validator)}
                      isSelected={isSelected(validator)}
                      key={index}
                      onSelect={onSelect(validator)}
                      reachedMaximum={reachedMaximum}
                      validatorInfo={validator}
                    />
                  ))
                }
                {isLoading && Array.from({ length: DEFAULT_VALIDATORS_PER_PAGE }).map((_, index) => (<UndefinedItem key={index} />))}
              </Stack>
              <PaginationRow
                itemsPerPage={itemsPerPage}
                options={VALIDATORS_PAGINATION_OPTIONS}
                page={page}
                setItemsPerPagePage={setItemsPerPagePage}
                setPage={setPage}
                totalItems={sortedValidatorsInformation?.length ?? 0}
              />
            </Stack>
          </VelvetBox>
          <FooterControls
            Icon={Firstline}
            isNextDisabled={isNextDisabled}
            maxSelectable={maximum}
            onBack={backToStakingHome}
            onNext={toggleReview}
            onReset={onReset}
            selectedCount={newSelectedValidators?.length}
          />
        </Stack>
      </HomeLayout>
      {review &&
        <ReviewPopup
          address={address}
          genesisHash={genesisHash}
          newSelectedValidators={newSelectedValidators}
          onClose={toggleReview}
          stakingConsts={stakingInfo.stakingConsts}
        />
      }
    </>
  );
}

export default memo(ManageValidators);
