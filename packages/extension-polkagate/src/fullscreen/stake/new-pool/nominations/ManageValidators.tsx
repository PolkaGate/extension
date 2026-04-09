// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Stack, Typography } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useValidatorsInformation from '@polkadot/extension-polkagate/src/hooks/useValidatorsInformation';

import PaginationRow from '../../../../fullscreen/history/PaginationRow';
import { usePoolStakingInfo, useStakingConsts, useTranslation, useValidatorSuggestion } from '../../../../hooks';
import VelvetBox from '../../../../style/VelvetBox';
import HomeLayout from '../../../components/layout';
import SystemSuggestion from '../../new-solo/nominations/SystemSuggestionButton';
import { createSelectionPrioritySorter, DEFAULT_VALIDATORS_PER_PAGE, getFilterValidators, getNominatedValidatorsInformation, getSortAndFilterValidators, isIncluded, VALIDATORS_PAGINATION_OPTIONS, VALIDATORS_SORTED_BY } from '../../new-solo/nominations/util';
import { UndefinedItem, ValidatorInfo } from '../../new-solo/nominations/ValidatorItem';
import FooterControls from '../../partials/FooterControls';
import TableToolbar from '../../partials/TableToolbar';
import ReviewPopup from './ReviewPopup';

function ManageValidators() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address, genesisHash } = useParams<{ address: string; genesisHash: string }>();
  const stakingInfo = usePoolStakingInfo(address, genesisHash);
  const validatorsInfo = useValidatorsInformation(genesisHash);
  const validatorsInformation = useMemo(() => {
    const info = validatorsInfo?.validatorsInformation;

    return info
      ? [...info.elected, ...info.waiting]
      : undefined;
  }, [validatorsInfo]);
  const nominatedValidatorsIds = useMemo(
    () => stakingInfo.pool === undefined
      ? undefined
      : stakingInfo.pool?.stashIdAccount?.nominators?.map((item) => item.toString()) ?? []
    , [stakingInfo.pool]
  );
  const nominatedValidatorsInformation = useMemo(() => getNominatedValidatorsInformation(validatorsInfo, nominatedValidatorsIds), [nominatedValidatorsIds, validatorsInfo]);

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
  const newSelectedIds = useMemo(() => new Set(newSelectedValidators.map(({ accountId }) => String(accountId))), [newSelectedValidators]);
  const nominatedIds = useMemo(() => new Set(nominatedValidatorsInformation?.map(({ accountId }) => String(accountId)) ?? []), [nominatedValidatorsInformation]);

  const sortedValidatorsInformation = useMemo(() => {
    if (!validatorsInformation || !nominatedValidatorsInformation) {
      return undefined;
    }

    const filteredValidators = getFilterValidators(validatorsInformation, search);
    const sortedAndFilteredValidators = getSortAndFilterValidators(filteredValidators, sortConfig);

    if (sortConfig === VALIDATORS_SORTED_BY.DEFAULT.toString() || systemSuggestion) {
      const compareBySelectionPriority = createSelectionPrioritySorter(newSelectedIds, nominatedIds);

      return sortedAndFilteredValidators?.sort((a, b) => compareBySelectionPriority(String(a.accountId), String(b.accountId)));
    }

    return sortedAndFilteredValidators;
  }, [nominatedIds, nominatedValidatorsInformation, newSelectedIds, search, sortConfig, systemSuggestion, validatorsInformation]);

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
    const isCheck = !systemSuggestion;

    onSearch('');
    setSystemSuggestion(isCheck);
    isCheck
      ? selectedBestValidators?.length && setNewSelectedValidators([...selectedBestValidators])
      : setNewSelectedValidators([]);
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
  const backToStakingHome = useCallback(() => navigate('/fullscreen-stake/pool/' + address + '/' + genesisHash) as void, [address, genesisHash, navigate]);
  const toggleReview = useCallback(() => setGoReview((isOnReview) => !isOnReview), []);

  const isLoading = useMemo(() => stakingInfo.pool === undefined || nominatedValidatorsIds === undefined || nominatedValidatorsInformation === undefined, [nominatedValidatorsIds, nominatedValidatorsInformation, stakingInfo.pool]);
  const isLoaded = useMemo(() => itemsToShow && itemsToShow.length > 0, [itemsToShow]);

  const isNextDisabled = useMemo(() => {
    if (!isLoaded || newSelectedIds.size === 0) {
      return true;
    }

    const isExactMatch =
      newSelectedIds.size === nominatedIds.size &&
      [...nominatedIds].every((id) => newSelectedIds.has(id));

    return isExactMatch;
  }, [isLoaded, newSelectedIds, nominatedIds]);

  return (
    <>
      <HomeLayout>
        <Stack direction='column' sx={{ alignItems: 'flex-start', px: '18px', width: '100%' }}>
          <Stack direction='column' sx={{ alignItems: 'flex-start', columnGap: '12px', pb: '26px', width: '100%' }}>
            <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-2'>
              {t('Edit Nominations')}
            </Typography>
            <Typography color='text.secondary' variant='B-4'>
              {t('Manage your pool nominated validators by considering their properties, including their commission rates. You can even filter them based on your preferences.')}
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
          poolId={stakingInfo.pool?.poolId}
          stakingConsts={stakingInfo.stakingConsts}
        />
      }
    </>
  );
}

export default memo(ManageValidators);
