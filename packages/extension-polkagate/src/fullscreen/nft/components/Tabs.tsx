// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FilterSectionProps } from '../utils/types';

import { Tab, Tabs as MUITabs } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

enum TabsNumber {
  NFT,
  UNIQUE,
  ALL
}

const tabStyle = { ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': { fontWeight: 500 }, color: 'primary.main', fontSize: '16px', fontWeight: 400 };

function Tabs ({ items, setItemsToShow }: FilterSectionProps): React.ReactElement {
  const [tab, setTab] = React.useState(TabsNumber.ALL);

  const handleChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);

  const nfts = items?.filter(({ isNft }) => isNft);
  const uniques = items?.filter(({ isNft }) => !isNft);

  // Memoize the filtered items to avoid unnecessary recalculations
  const filteredItems = useMemo(() => {
    if (items === undefined || items?.length === 0) {
      return undefined;
    }

    if (items === null) {
      return null;
    }

    switch (tab) {
      case TabsNumber.NFT:
        return nfts;

      case TabsNumber.UNIQUE:
        return uniques;

      case TabsNumber.ALL:
        return items;

      default:
        return items;
    }
  }, [items, nfts, tab, uniques]); // all the filter options added to the deps in order to ensure useMemo will realize the changes

  useEffect(() => {
    setItemsToShow(filteredItems);
  }, [filteredItems, filteredItems?.length, setItemsToShow]);

  return (
    <MUITabs centered onChange={handleChange} sx={{ mt: '20px' }} value={tab}>
      <Tab disabled={!items} label={`All ${items ? `(${items.length})` : ''}`} sx={tabStyle} value={TabsNumber.ALL} />
      <Tab disabled={!items} label={`NFTs ${nfts ? `(${nfts.length})` : ''}`} sx={tabStyle} value={TabsNumber.NFT} />
      <Tab disabled={!items} label={`Uniques ${uniques ? `(${uniques.length})` : ''}`} sx={tabStyle} value={TabsNumber.UNIQUE} />
    </MUITabs>
  );
}

export default React.memo(Tabs);