// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterAction, FilterSectionProps, FilterState, ItemInformation, SortAction, SortState } from '../utils/types';

import { Stack } from '@mui/material';
import { selectableNetworks } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useReducer, useState } from 'react';

import { SearchField } from '@polkadot/extension-polkagate/src/components/index';

import { usePrices, useTranslation } from '../../../hooks';
import NftFilter from './NftFilter';

const initialFilterState: FilterState = {
  collections: false,
  kusama: false,
  nft: false,
  polkadot: false,
  unique: false
};

const initialSortState = {
  highPrice: false,
  lowPrice: false,
  newest: false,
  oldest: false
};

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  return {
    ...state,
    [action.filter]: !state[action.filter]
  };
};

const sortReducer = (state: SortState, action: SortAction): SortState => {
  return {
    ...state,
    [action.enable]: true,
    [action.unable]: false
  };
};

function Filters({ items, setItemsToShow }: FilterSectionProps): React.ReactElement {
  const prices = usePrices();
  const { t } = useTranslation();
  const [filters, dispatchFilter] = useReducer(filterReducer, initialFilterState);
  const [searchedTxt, setSearchTxt] = useState<string | undefined>();
  const [sort, dispatchSort] = useReducer(sortReducer, initialSortState);

  const onSearch = useCallback((text: string) => {
    setSearchTxt(text);
  }, []);

  const getDecimal = useCallback((chainName: string) => {
    return selectableNetworks.find(({ network }) => network.toLowerCase() === chainName)?.decimals[0];
  }, []);

  const calculatePrice = useCallback((item: ItemInformation) => {
    if (!prices?.prices || !item.price) {
      return 0;
    }

    const currency = item.chainName.toLowerCase().includes('kusama')
      ? 'kusama'
      : 'polkadot';
    const decimal = getDecimal(currency) ?? 0;

    return (item.price / (10 ** decimal)) * prices.prices[currency].value;
  }, [getDecimal, prices]);

  const sortItems = useCallback((itemsToSort: ItemInformation[]) => {
    if (sort.highPrice) {
      return [...itemsToSort].sort((a, b) => calculatePrice(b) - calculatePrice(a));
    }

    if (sort.lowPrice) {
      return [...itemsToSort].sort((a, b) => calculatePrice(a) - calculatePrice(b));
    }

    return itemsToSort;
  }, [calculatePrice, sort]);

  useEffect(() => {
    if (!items?.length) {
      setItemsToShow(items);

      return;
    }

    try {
      let filtered = items.filter((item) => {
        const matchesSearch = !searchedTxt ||
          item.chainName.toLowerCase().includes(searchedTxt.toLowerCase()) ||
          item.collectionId?.toString().toLowerCase().includes(searchedTxt.toLowerCase()) ||
          item.collectionName?.toLowerCase().includes(searchedTxt.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchedTxt.toLowerCase()) ||
          item.itemId?.toString().toLowerCase().includes(searchedTxt.toLowerCase());

        const matchesNetwork = (!filters.kusama && !filters.polkadot) ||
          (filters.kusama && item.chainName.toLowerCase().includes('kusama')) ||
          (filters.polkadot && item.chainName.toLowerCase().includes('polkadot'));

        const matchesType = (!filters.nft && !filters.unique) ||
          (filters.nft && item.isNft) ||
          (filters.unique && !item.isNft);

        const matchesCollection = !filters.collections || item.isCollection;

        return matchesSearch && matchesNetwork && matchesType && matchesCollection;
      });

      // Apply sorting
      filtered = sortItems(filtered);

      setItemsToShow(filtered);
    } catch (error) {
      console.error('Error filtering items:', error);
      setItemsToShow(items); // Fallback to original items on error
    }
  }, [items, filters, searchedTxt, sortItems, setItemsToShow]);

  return (
    <Stack alignItems='center' columnGap='15px' direction='row' justifyContent='space-between' sx={{ mt: '20px' }}>
      <SearchField
        onInputChange={onSearch}
        placeholder={t('🔍 Search')}
        placeholderStyle={{ textAlign: 'left' }}
        style={{ minWidth: '380px', width: '40%' }}
      />
      <NftFilter
        dispatchFilter={dispatchFilter}
        dispatchSort={dispatchSort}
        filters={filters}
        sort={sort}
      />
    </Stack>
  );
}

export default React.memo(Filters);
