// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';
import type { FilterOptions } from '../hookUtils/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

import ChainDropDown from '@polkadot/extension-polkagate/src/components/ChainDropDown';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';

import { ActionContext, BackWithLabel, FadeOnScroll, Motion } from '../../../components';
import { useChainInfo, useSelectedAccount, useTranslation } from '../../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../../partials';
import useTransactionHistory from '../useTransactionHistory';
import HistoryBox from './HistoryBox';
import HistoryTabs, { TAB } from './HistoryTabs';

function History(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const selectedAccount = useSelectedAccount();
  const savedSelectedChain = useAccountSelectedChain(selectedAccount?.address);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<TAB>(TAB.ALL);
  const { decimal, token } = useChainInfo(savedSelectedChain as string, true);

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

  const { grouped } = useTransactionHistory(selectedAccount?.address, savedSelectedChain as string | undefined, historyFilter);

  const historyItemsToShow = useMemo(() => {
    if (!grouped) {
      return grouped;
    }

    const result = Object.fromEntries(
      Object.entries(grouped)
        .map(([date, items]) => {
          const filteredItems = items.filter(
            ({ token: historyItemToken }) => historyItemToken === token
          )
            .map((item) => ({ ...item, decimal }));

          return [date, filteredItems];
        })
        .filter(([, filteredItems]) => filteredItems.length > 0)
    ) as Record<string, TransactionDetail[]>;

    // Check if result is an empty object
    return Object.keys(result).length === 0 ? null : result;
  }, [decimal, grouped, token]);

  const onBack = useCallback(() => onAction('/'), [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader />
      <BackWithLabel
        onClick={onBack}
        text={t('Transaction History')}
      />
      <Motion variant='slide'>
        <HistoryTabs
          selectedChain={savedSelectedChain as string}
          setTab={setTab}
          tab={tab}
        />
        {
          savedSelectedChain !== undefined &&
          <ChainDropDown
            style={{ margin: '12px 15px', width: 'calc(100% - 30px)' }}
            withSelectAChainText={false}
          />
        }
        <Grid container item ref={scrollContainerRef} sx={{ height: 'fit-content', maxHeight: '400px', mt: '10px', overflowY: 'auto', pb: '60px' }}>
          <HistoryBox
            historyItems={historyItemsToShow}
            notReady={!savedSelectedChain}
            style={{ margin: '10px 12px 15px', width: 'calc(100% - 24px)' }}
          />
        </Grid>
        <FadeOnScroll
          containerRef={scrollContainerRef}
        />
      </Motion>
      <HomeMenu />
    </Container>
  );
}

export default History;
