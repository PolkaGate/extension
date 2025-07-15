// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { Add, ArrowLeft, Firstline, InfoCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { noop } from '@polkadot/util';

import { ActionButton, GradientButton, GradientDivider, GradientSwitch, MyTooltip } from '../../../../components';
import PaginationRow from '../../../../fullscreen/history/PaginationRow';
import { useSelectedAccount, useSoloStakingInfo, useStakingConsts2, useTranslation, useValidatorsInformation, useValidatorSuggestion2 } from '../../../../hooks';
import { EmptyNomination } from '../../../../popup/staking/solo-new/nominations/NominationsSetting';
import VelvetBox from '../../../../style/VelvetBox';
import { SYSTEM_SUGGESTION_TEXT } from '../../../../util/constants';
import HomeLayout from '../../../components/layout';
import { DEFAULT_VALIDATORS_PER_PAGE, getFilterValidators, getSortAndFilterValidators, VALIDATORS_PAGINATION_OPTIONS, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem, ValidatorInfo } from './ValidatorItem';
import { ValidatorToolbar } from './ValidatorsTabBody';

interface SystemSuggestionProps {
  systemSuggestion: boolean;
  onSystemSuggestion: () => void;
  disabled: boolean;
}

const SystemSuggestion = ({ disabled, onSystemSuggestion, systemSuggestion }: SystemSuggestionProps) => {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, width: 'fit-content' }}>
      <GradientSwitch
        checked={systemSuggestion}
        disabled={disabled}
        onChange={onSystemSuggestion}
      />
      <Typography color='text.secondary' variant='B-4'>
        {t('System Suggestions')}
      </Typography>
      <MyTooltip
        content={t(SYSTEM_SUGGESTION_TEXT)}
      >
        <InfoCircle color='#AA83DC' size='16' variant='Bold' />
      </MyTooltip>
    </Container>
  );
};

function ManageValidators () {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const selectedAccount = useSelectedAccount();
  const stakingInfo = useSoloStakingInfo(selectedAccount?.address, genesisHash);
  const validatorsInfo = useValidatorsInformation(genesisHash);
  const selectedBestValidators = useValidatorSuggestion2(validatorsInfo, genesisHash);
  const stakingConsts = useStakingConsts2(genesisHash);

  const [systemSuggestion, setSystemSuggestion] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<string>(VALIDATORS_SORTED_BY.DEFAULT);
  const [search, setSearch] = useState<string>('');
  const [newSelectedValidators, setNewSelectedValidators] = useState<ValidatorInformation[]>([]);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPagePage] = useState<string | number>(DEFAULT_VALIDATORS_PER_PAGE);

  const maximum = useMemo(() => stakingConsts?.maxNominations || 0, [stakingConsts?.maxNominations]);

  const nominatedValidatorsIds = useMemo(() =>
    stakingInfo?.stakingAccount === null || stakingInfo?.stakingAccount?.nominators?.length === 0
      ? null
      : stakingInfo?.stakingAccount?.nominators.map((item) => item.toString())
  , [stakingInfo?.stakingAccount]);

  const nominatedValidatorsInformation = useMemo(() => {
    if (!validatorsInfo || !nominatedValidatorsIds) {
      return undefined;
    }

    return [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting]
      .filter(({ accountId }) => nominatedValidatorsIds.includes(accountId.toString()));
  }, [nominatedValidatorsIds, validatorsInfo]);

  const validatorsInformation = useMemo(() => {
    if (!validatorsInfo) {
      return undefined;
    }

    return [...validatorsInfo.validatorsInformation.elected, ...validatorsInfo.validatorsInformation.waiting];
  }, [validatorsInfo]);

  const sortedValidatorsInformation = useMemo(() => {
    if (!validatorsInformation || !nominatedValidatorsInformation) {
      return undefined;
    }

    const newSelectedIds = new Set(newSelectedValidators.map(({ accountId }) => String(accountId)));
    const nominatedIds = new Set(nominatedValidatorsInformation.map(({ accountId }) => String(accountId)));

    const filteredValidators = getFilterValidators(validatorsInformation, search);
    const sortedAndFilteredValidators = getSortAndFilterValidators(filteredValidators, sortConfig);

    if (sortConfig === VALIDATORS_SORTED_BY.DEFAULT.toString() || systemSuggestion) {
      return sortedAndFilteredValidators?.sort((a, b) => {
        const aId = String(a.accountId);
        const bId = String(b.accountId);

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
      });
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

  const isSelected = useCallback((validator: ValidatorInformation) =>
    Boolean(newSelectedValidators?.find(({ accountId }) => accountId.toString() === validator.accountId.toString()))
  , [newSelectedValidators]);

  const isAlreadySelected = useCallback((validator: ValidatorInformation) =>
    Boolean(nominatedValidatorsInformation?.find(({ accountId }) => String(accountId) === String(validator.accountId)))
  , [nominatedValidatorsInformation]);

  const onSelect = useCallback((validator: ValidatorInformation) => () => {
    setNewSelectedValidators((prev) => {
      const current = prev || [];

      const validatorId = String(validator.accountId);
      const existingIndex = current.findIndex(({ accountId }) => String(accountId) === String(validatorId));

      if (existingIndex >= 0) {
        if (current.length >= maximum) {
          return prev;
        }

        // Remove if exists
        const newArray = [...current];

        newArray.splice(existingIndex, 1);

        return newArray;
      } else {
        // Add if doesn't exist
        return [...current, validator];
      }
    });
  }, [maximum]);
  const onReset = useCallback(() => {
    setNewSelectedValidators([]);
    setSystemSuggestion(false);
  }, []);
  const backToStakingHome = useCallback(() => navigate('/fullscreen-stake/solo/' + genesisHash) as void, [genesisHash, navigate]);

  const isLoading = useMemo(() => (stakingInfo?.stakingAccount === undefined || nominatedValidatorsInformation === undefined), [nominatedValidatorsInformation, stakingInfo?.stakingAccount]);
  const isLoaded = useMemo(() => itemsToShow && itemsToShow.length > 0, [itemsToShow]);
  const nothingToShow = useMemo(() => stakingInfo?.stakingAccount?.nominators && stakingInfo?.stakingAccount.nominators.length === 0, [stakingInfo?.stakingAccount?.nominators]);

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

    console.log('isExactMatch:', isExactMatch);
    console.log('selectedIds:', selectedIds);
    console.log('nominatedIds:', nominatedIds);

    // Enable the "Next" button only if there is a meaningful change in selection
    return isExactMatch;
  }, [isLoaded, newSelectedValidators, nominatedValidatorsIds]);

  return (
    <HomeLayout>
      <Stack direction='column' sx={{ alignItems: 'flex-start', px: '18px', width: '100%' }}>
        <Stack direction='column' sx={{ alignItems: 'flex-start', columnGap: '12px', pb: '26px', width: '100%' }}>
          <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-2'>
            {t('Manage Validators')}
          </Typography>
          <Typography color='text.secondary' variant='B-4'>
            {t('Manage your nominated validators by considering their properties, including their commission rates. You can even filter them based on your preferences.')}
          </Typography>
        </Stack>
        <VelvetBox>
          <Stack direction='column' sx={{ width: '100%' }}>
            <ValidatorToolbar
              onSearch={onSearch}
              setSortBy={onSortChange as React.Dispatch<React.SetStateAction<string>>}
              sortBy={sortConfig}
            >
              <SystemSuggestion
                disabled={!isLoaded}
                onSystemSuggestion={onSystemSuggestion}
                systemSuggestion={systemSuggestion}
              />
            </ValidatorToolbar>
            <Stack direction='column' sx={{ gap: '2px', width: '100%' }}>
              {isLoaded &&
                itemsToShow?.map((validator, index) => (
                  <ValidatorInfo
                    genesisHash={genesisHash}
                    isAlreadySelected={isAlreadySelected(validator)}
                    isSelected={isSelected(validator)}
                    key={index}
                    onDetailClick={noop}
                    onSelect={onSelect(validator)}
                    validatorInfo={validator}
                  />
                ))
              }
              {isLoading && Array.from({ length: DEFAULT_VALIDATORS_PER_PAGE }).map((_, index) => (<UndefinedItem key={index} />))}
              {nothingToShow && <EmptyNomination />}
            </Stack>
            <PaginationRow
              itemsPerPage={itemsPerPage}
              options={VALIDATORS_PAGINATION_OPTIONS}
              page={page}
              setItemsPerPagePage={setItemsPerPagePage}
              setPage={setPage}
              totalItems={validatorsInformation?.length ?? 0}
            />
          </Stack>
        </VelvetBox>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pt: '26px', width: '100%', zIndex: 1 }}>
          <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, width: 'fit-content' }}>
            <ActionButton
              StartIcon={ArrowLeft}
              contentPlacement='center'
              iconSize={24}
              iconVariant='Linear'
              onClick={backToStakingHome}
              style={{
                height: '44px',
                width: '90px'
              }}
              text={t('Back')}
              variant='text'
            />
            <GradientDivider
              isBlueish
              orientation='vertical'
              style={{ height: '40px', mx: '4px' }}
            />
            <Firstline color='#674394' size='18' variant='Bold' />
            <Typography color='#AA83DC' variant='B-2'>
              <span style={{ color: theme.palette.text.primary }}>{newSelectedValidators?.length || 0}</span>
              {t(' / {{maximum}} selected', { replace: { maximum } })}
            </Typography>
            <Add color='#674394' onClick={onReset} size='28' style={{ cursor: 'pointer', rotate: '45deg' }} />
          </Container>
          <GradientButton
            disabled={isNextDisabled}
            onClick={noop}
            style={{ height: '44px', width: '244px' }}
            text={t('Next')}
          />
        </Container>
      </Stack>
    </HomeLayout>
  );
}

export default memo(ManageValidators);
