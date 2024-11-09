// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FilterSectionProps, ItemInformation } from '../utils/types';

import { Divider, Tab, Tabs as MUITabs } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

enum TABS_MAP {
  NFT,
  UNIQUE,
  ALL,
  DIVIDER
}

const tabStyle = { ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': { fontWeight: 500 }, color: 'primary.light', fontSize: '16px', fontWeight: 400 };
const TabDivider = () => <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={TABS_MAP.DIVIDER} />;

function Tabs ({ items, setItemsToShow }: FilterSectionProps): React.ReactElement {
  const [tab, setTab] = useState<TABS_MAP>(TABS_MAP.ALL);

  const handleChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);

  const sorter = useCallback((itemA: ItemInformation, itemB: ItemInformation) => {
    if (itemA.data == null && itemB.data == null) {
      return 0;
    }

    if (itemA.data == null) {
      return 1;
    }

    if (itemB.data == null) {
      return -1;
    }

    return 0;
  }, []);

  const nfts = useMemo(() => items?.filter(({ isNft }) => isNft), [items]);
  const uniques = useMemo(() => items?.filter(({ isNft }) => !isNft), [items]);

  useEffect(() => {
    if (items === undefined || items?.length === 0) {
      setItemsToShow(undefined);

      return;
    }

    if (items === null) {
      setItemsToShow(null);

      return;
    }

    switch (tab) {
      case TABS_MAP.NFT:
        setItemsToShow([...(nfts ?? [])]?.sort(sorter));
        break;

      case TABS_MAP.UNIQUE:
        setItemsToShow(uniques?.sort(sorter));
        break;

      case TABS_MAP.ALL:
        setItemsToShow([...items].sort(sorter));
        break;

      default:
        setItemsToShow([...items].sort(sorter));
        break;
    }
  }, [items, items?.length, nfts, setItemsToShow, sorter, tab, uniques]);

  return (
    <MUITabs centered onChange={handleChange} sx={{ mt: '20px' }} value={tab}>
      <Tab disabled={!items} label={`All ${items ? `(${items.length})` : ''}`} sx={tabStyle} value={TABS_MAP.ALL} />
      <TabDivider />
      <Tab disabled={!items} label={`NFTs ${nfts ? `(${nfts.length})` : ''}`} sx={tabStyle} value={TABS_MAP.NFT} />
      <TabDivider />
      <Tab disabled={!items} label={`Uniques ${uniques ? `(${uniques.length})` : ''}`} sx={tabStyle} value={TABS_MAP.UNIQUE} />
    </MUITabs>
  );
}

export default React.memo(Tabs);
