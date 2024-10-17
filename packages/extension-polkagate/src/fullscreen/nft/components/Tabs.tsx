// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FilterSectionProps } from '../utils/types';

import { Divider, Tab, Tabs as MUITabs } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

enum TabsNumber {
  NFT,
  UNIQUE,
  ALL,
  DIVIDER
}

const tabStyle = { ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': { fontWeight: 500 }, color: 'primary.main', fontSize: '16px', fontWeight: 400 };
const TabDivider = () => <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={TabsNumber.DIVIDER} />;

function Tabs ({ items, setItemsToShow }: FilterSectionProps): React.ReactElement {
  const [tab, setTab] = useState<TabsNumber>(TabsNumber.ALL);

  const handleChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);

  const nfts = items?.filter(({ isNft }) => isNft);
  const uniques = items?.filter(({ isNft }) => !isNft);

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
  }, [items, nfts, tab, uniques]);

  useEffect(() => {
    setItemsToShow(filteredItems);
  }, [filteredItems, filteredItems?.length, setItemsToShow]);

  return (
    <MUITabs centered onChange={handleChange} sx={{ mt: '20px' }} value={tab}>
      <Tab disabled={!items} label={`All ${items ? `(${items.length})` : ''}`} sx={tabStyle} value={TabsNumber.ALL} />
      <TabDivider />
      <Tab disabled={!items} label={`NFTs ${nfts ? `(${nfts.length})` : ''}`} sx={tabStyle} value={TabsNumber.NFT} />
      <TabDivider />
      <Tab disabled={!items} label={`Uniques ${uniques ? `(${uniques.length})` : ''}`} sx={tabStyle} value={TabsNumber.UNIQUE} />
    </MUITabs>
  );
}

export default React.memo(Tabs);
