// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { CheckboxButtonProps, FilterSectionProps } from '../utils/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Checkbox2 from '../../../components/Checkbox2';
import InputFilter from '../../../components/InputFilter';

const CheckboxButton = ({ checked, disabled, onChange, title }: CheckboxButtonProps) => {
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
};

export default function FilterSection ({ myNFTsDetails, myUniquesDetails, setItemsToShow }: FilterSectionProps): React.ReactElement {
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

  const filteredItems = useMemo(() => {
    if (allItems === undefined || allItems?.length === 0) {
      return undefined;
    }

    if (allItems === null) {
      return null;
    }

    return allItems.filter((item) => {
      const { collectionId, isCreator, isNft, isOwner, itemId } = item;
      const { search, showMyCreated, showMyNFTs, showMyUniques, showOwn } = filters;

      const matchesSearch = search
        ? [collectionId, itemId].some((field) => field?.toLowerCase().includes(search.toLowerCase()))
        : true;

      return (
        matchesSearch &&
        ((isNft && showMyNFTs) ||
          (!isNft && showMyUniques) ||
          (isCreator && showMyCreated) ||
          (isOwner && showOwn))
      );
    });
  }, [allItems, filters]);

  useEffect(() => {
    setItemsToShow(filteredItems);
  }, [filteredItems, setItemsToShow]);

  return (
    <Grid alignItems='flex-end' container item justifyContent='space-around' sx={{ borderBottom: '2px solid', borderBottomColor: 'divider', mt: '20px', py: '5px' }}>
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
