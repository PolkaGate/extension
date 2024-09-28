// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { CheckboxButtonProps, FilterSectionProps } from '../utils/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Checkbox2 from '../../../components/Checkbox2';
import InputFilter from '../../../components/InputFilter';

const CheckboxButton = React.memo(function CheckboxButton ({ checked, disabled, onChange, title }: CheckboxButtonProps) {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container item justifyContent='flex-start' sx={{ color: theme.palette.mode === 'light' ? 'secondary.main' : 'text.primary', cursor: 'pointer', textDecorationLine: 'underline', width: 'fit-content' }}>
      <Checkbox2
        checked={checked}
        disabled={disabled}
        label={title}
        labelStyle={{ fontSize: '16px', fontWeight: 400 }}
        onChange={onChange}
      />
    </Grid>
  );
});

function FilterSection ({ myNFTsDetails, myUniquesDetails, setItemsToShow }: FilterSectionProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [filters, setFilters] = useState({
    search: '',
    showMyCreated: true,
    showMyNFTs: true,
    showMyUniques: true,
    showOwn: true
  });

  const updateFilter = useCallback((key: keyof typeof filters) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFilters((prev) => ({ ...prev, [key]: checked }));
  }, []);

  const onSearch = useCallback((searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  }, []);

  const allItems = useMemo(() => {
    if (!myNFTsDetails && !myUniquesDetails) {
      return undefined;
    }

    if (myNFTsDetails?.length === 0 && myUniquesDetails?.length === 0) {
      return null;
    }

    return [...(myNFTsDetails || []), ...(myUniquesDetails || [])];
  }, [myNFTsDetails, myUniquesDetails]);

  // Memoize the filtered items to avoid unnecessary recalculations
  const filteredItems = useMemo(() => {
    if (allItems === undefined || allItems?.length === 0) {
      return undefined;
    }

    if (allItems === null) {
      return null;
    }

    const lowerSearch = filters.search.toLowerCase();

    return allItems.filter((item) => {
      const { collectionId, isCreator, isNft, isOwner, itemId } = item;
      const { showMyCreated, showMyNFTs, showMyUniques, showOwn } = filters;

      // First, check if the item matches the search criteria
      const matchesSearch = !lowerSearch ||
        [collectionId, itemId].some((field) => field?.toLowerCase().includes(lowerSearch));

      // Then, check if the item passes the NFT/Unique filter
      const passesNftFilter = (isNft && showMyNFTs) || (!isNft && showMyUniques);

      // Finally, check if the item passes the owner/creator filter
      const passesOwnerCreatorFilter = (isCreator && showMyCreated) || (isOwner && showOwn);

      // The item must pass all three conditions to be included
      return matchesSearch && passesNftFilter && passesOwnerCreatorFilter;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allItems, filters.search, filters.showMyCreated, filters.showMyNFTs, filters.showMyUniques, filters.showOwn]); // all the filter options added to the deps in order to ensure useMemo will realize the changes

  useEffect(() => {
    setItemsToShow(filteredItems);
  }, [filteredItems, filteredItems?.length, setItemsToShow]);

  return (
    <Grid alignItems='flex-end' container item justifyContent='space-around' sx={{ borderBottom: '2px solid', borderBottomColor: 'divider', mt: '20px', py: '5px' }}>
      {filteredItems &&
        <Typography>
          {t('Items')}{` (${filteredItems.length})`}
        </Typography>
      }
      <CheckboxButton checked={filters.showMyCreated} disabled={!allItems} onChange={updateFilter('showMyCreated')} title={t('Created')} />
      <CheckboxButton checked={filters.showOwn} disabled={!allItems} onChange={updateFilter('showOwn')} title={t('Own')} />
      <CheckboxButton checked={filters.showMyUniques} disabled={!allItems} onChange={updateFilter('showMyUniques')} title={t('Uniques')} />
      <CheckboxButton checked={filters.showMyNFTs} disabled={!allItems} onChange={updateFilter('showMyNFTs')} title={t('NFTs')} />
      <Grid container item justifyContent='flex-start' width='30%'>
        <InputFilter
          autoFocus={false}
          disabled={!allItems}
          onChange={onSearch}
          placeholder={t('🔍 Search in nfts ')}
          theme={theme}
          value={filters.search}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(FilterSection);
