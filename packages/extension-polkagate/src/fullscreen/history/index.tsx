// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterOptions } from '@polkadot/extension-polkagate/src/popup/history/hookUtils/types';

import { Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useEffect, useMemo, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import HistoryTabs from '@polkadot/extension-polkagate/src/popup/history/newDesign/HistoryTabs';
import useTransactionHistory from '@polkadot/extension-polkagate/src/popup/history/useTransactionHistory';
import { isSystemChain } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { useChainInfo, useSelectedAccount, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';
import { ALL_TYPES, ANY_STATUS, TAB } from './consts';
import HistoryBox from './HistoryBox';
import HistoryFilterRow from './HistoryFilterRow';
import PaginationRow from './PaginationRow';

const DEFAULT_ITEMS_PER_PAGE = 10;
const DEFAULT_EXTRA_FILTERS = {
  status: ANY_STATUS,
  type: ALL_TYPES
};

const options = [
  { text: '8', value: 8 },
  { text: '10', value: 10 },
  { text: '20', value: 20 },
  { text: '50', value: 50 }
];

function HistoryFs (): React.ReactElement {
  const { t } = useTranslation();

  const selectedAccount = useSelectedAccount();
  const savedSelectedChain = useAccountSelectedChain(selectedAccount?.address);
  const { decimal, token } = useChainInfo(savedSelectedChain as string, true);

  const [tab, setTab] = useState<TAB>(TAB.ALL);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPagePage] = useState<string | number>(DEFAULT_ITEMS_PER_PAGE);
  const [extraFilters, setExtraFilters] = useState(DEFAULT_EXTRA_FILTERS);
  const [count, setCount] = useState(0);

  const historyFilter: FilterOptions = useMemo(() => {
    const defaultFilters = {
      governance: false,
      staking: false,
      transfers: false
    };

    const filterMap: Record<TAB, FilterOptions> = {
      [TAB.ALL]: { governance: true, staking: true, transfers: true },
      [TAB.GOVERNANCE]: { ...defaultFilters, governance: true },
      [TAB.STAKING]: { ...defaultFilters, staking: true },
      [TAB.TRANSFERS]: { ...defaultFilters, transfers: true }
    };

    return filterMap[tab] ?? filterMap[TAB.ALL];
  }, [tab]);

  const { allHistories, grouped } = useTransactionHistory(selectedAccount?.address, savedSelectedChain as string | undefined, historyFilter);

  const historyItemsToShow = useMemo(() => {
    if (!grouped) {
      return grouped;
    }

    const flattenedHistories = Object.entries(grouped).map(([_, histories]) => histories).flat();
    const historyGenesisHash = flattenedHistories[0]?.chain?.genesisHash;
    const isHistoryRecordsRelatedToSelectedChain = historyGenesisHash === savedSelectedChain || isSystemChain(historyGenesisHash, savedSelectedChain as string | undefined); // TODO: We may need to fetch people system chain history as well

    if (savedSelectedChain && !isHistoryRecordsRelatedToSelectedChain) {
      return null;
    }

    const result = flattenedHistories.map((item) => {
      if (item.token === token) {
        return { decimal, ...item };
      }

      return undefined;
    }).filter((item) => !!item)
      .filter((item) =>
        (extraFilters.type === ALL_TYPES || extraFilters.type === item.subAction) &&
        (extraFilters.status === ANY_STATUS || (extraFilters.status === 'Completed' && item.success) || (extraFilters.status === 'Failed' && !item.success)));

    setCount(result.length);

    if (result.length === 0) {
      return null;
    }

    const start = (page - 1) * Number(itemsPerPage);
    const end = start + Number(itemsPerPage);

    return result.slice(start, end);
  }, [grouped, savedSelectedChain, page, itemsPerPage, token, decimal, extraFilters]);

  useEffect(() => { // reset
    setExtraFilters(DEFAULT_EXTRA_FILTERS);
    setCount(0);
  }, [tab, savedSelectedChain, selectedAccount]);

  return (
    <HomeLayout>
      <Typography color='text.primary' sx={{ ml: '25px', textTransform: 'uppercase' }} variant='H-2'>
        {t('History')}
      </Typography>
      <HistoryTabs
        selectedChain={savedSelectedChain ?? POLKADOT_GENESIS}
        setTab={setTab}
        tab={tab}
      />
      <VelvetBox style={{ margin: '20px 22px 15px', width: 'calc(100% - 24px)' }}>
        <HistoryFilterRow
          allHistories={allHistories}
          extraFilters={extraFilters}
          setExtraFilters={setExtraFilters}
        />
        <HistoryBox
          historyItems={historyItemsToShow}
          notReady={!savedSelectedChain}
        />
        <PaginationRow
          itemsPerPage={itemsPerPage}
          options={options}
          page={page}
          setItemsPerPagePage={setItemsPerPagePage}
          setPage={setPage}
          totalItems={count}
        />
      </VelvetBox>
    </HomeLayout>
  );
}

export default React.memo(HistoryFs);
