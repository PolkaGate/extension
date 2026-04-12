// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Dispatch, SetStateAction } from 'react';
import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Stack, Typography } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React, { useCallback } from 'react';

import PaginationRow from '../../../../fullscreen/history/PaginationRow';
import { useTranslation } from '../../../../hooks';
import { NothingFound } from '../../../../partials';
import VelvetBox from '../../../../style/VelvetBox';
import HomeLayout from '../../../components/layout';
import FooterControls from '../../partials/FooterControls';
import TableToolbar from '../../partials/TableToolbar';
import SystemSuggestion from './SystemSuggestionButton';
import { DEFAULT_VALIDATORS_PER_PAGE, VALIDATORS_PAGINATION_OPTIONS, VALIDATORS_SORTED_BY } from './util';
import { UndefinedItem, ValidatorInfo } from './ValidatorItem';

interface Props {
  description: string;
  genesisHash: string | undefined;
  isAlreadySelected: (validator: ValidatorInformation) => boolean;
  isLoaded: boolean;
  isLoading: boolean;
  isNextDisabled: boolean;
  isSelected: (validator: ValidatorInformation) => boolean;
  itemsPerPage: string | number;
  itemsToShow: ValidatorInformation[] | undefined;
  maximum: number;
  onBack: () => void;
  onNext: () => void;
  onReset: () => void;
  onSearch: (input: string) => void;
  onSelect: (validator: ValidatorInformation) => () => void;
  onSortChange: (sortBy: string) => void;
  onSystemSuggestion: () => void;
  page: number;
  reachedMaximum: boolean;
  selectedCount: number;
  setItemsPerPagePage: Dispatch<SetStateAction<string | number>>;
  setPage: Dispatch<SetStateAction<number>>;
  sortConfig: string;
  systemSuggestion: boolean;
  totalItems: number;
}

export default function ManageValidatorsView({ description,
  genesisHash,
  isAlreadySelected,
  isLoaded,
  isLoading,
  isNextDisabled,
  isSelected,
  itemsPerPage,
  itemsToShow,
  maximum,
  onBack,
  onNext,
  onReset,
  onSearch,
  onSelect,
  onSortChange,
  onSystemSuggestion,
  page,
  reachedMaximum,
  selectedCount,
  setItemsPerPagePage,
  setPage,
  sortConfig,
  systemSuggestion,
  totalItems }: Props): React.ReactElement {
  const { t } = useTranslation();
  const handleSortByChange = useCallback((value: SetStateAction<string>) => {
    if (typeof value === 'function') {
      return;
    }

    onSortChange(value);
  }, [onSortChange]);

  return (
    <HomeLayout>
      <Stack direction='column' sx={{ alignItems: 'flex-start', px: '18px', width: '100%' }}>
        <Stack direction='column' sx={{ alignItems: 'flex-start', columnGap: '12px', pb: '26px', width: '100%' }}>
          <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-2'>
            {t('Edit Nominations')}
          </Typography>
          <Typography color='text.secondary' variant='B-4'>
            {description}
          </Typography>
        </Stack>
        <VelvetBox>
          <Stack direction='column' sx={{ width: '100%' }}>
            <TableToolbar
              onSearch={onSearch}
              setSortBy={handleSortByChange}
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
                itemsToShow?.map((validator) => (
                  <ValidatorInfo
                    genesisHash={genesisHash}
                    isAlreadySelected={isAlreadySelected(validator)}
                    isSelected={isSelected(validator)}
                    key={String(validator.accountId)}
                    onSelect={onSelect(validator)}
                    reachedMaximum={reachedMaximum}
                    validatorInfo={validator}
                  />
                ))
              }
              {isLoading &&
                Array.from({ length: DEFAULT_VALIDATORS_PER_PAGE })
                  .map((_, index) => (
                    <UndefinedItem key={index} />))
              }
              {!isLoading && isLoaded && itemsToShow?.length === 0 &&
                <NothingFound
                  show
                  style={{ pt: '80px' }}
                  text={t('Validator(s) Not Found')}
                />
              }
            </Stack>
            <PaginationRow
              itemsPerPage={itemsPerPage}
              options={VALIDATORS_PAGINATION_OPTIONS}
              page={page}
              setItemsPerPagePage={setItemsPerPagePage}
              setPage={setPage}
              totalItems={totalItems}
            />
          </Stack>
        </VelvetBox>
        <FooterControls
          Icon={Firstline}
          isNextDisabled={isNextDisabled}
          maxSelectable={maximum}
          onBack={onBack}
          onNext={onNext}
          onReset={onReset}
          selectedCount={selectedCount}
        />
      </Stack>
    </HomeLayout>
  );
}
