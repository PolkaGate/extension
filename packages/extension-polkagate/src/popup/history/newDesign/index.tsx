// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption, TransactionDetail } from '../../../util/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import useAccountSelectedChain, { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { updateStorage } from '@polkadot/extension-polkagate/src/util/index';

import { ActionContext, BackWithLabel, DropSelect, FadeOnScroll, GenesisHashOptionsContext } from '../../../components';
import { useChainInfo, useSelectedAccount, useTranslation } from '../../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../../partials';
import useTransactionHistory2 from '../useTransactionHistory2';
import HistoryBox from './HistoryBox';
import HistoryTabs, { TAB } from './HistoryTabs';
import type { FilterOptions } from '../hookUtils/types';

const DEFAULT_SELECTED_OPTION: DropdownOption = { text: 'Select a chain', value: '' };

function History (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const options = useContext(GenesisHashOptionsContext);
  const selectedAccount = useSelectedAccount();
  const savedSelectedChain = useAccountSelectedChain(selectedAccount?.address);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<TAB>(TAB.ALL);
  const [selectedChain, setSelectedChain] = useState<number | string>(DEFAULT_SELECTED_OPTION.value);
  const { decimal, token } = useChainInfo(selectedChain as string, true);

  useEffect(() => {
    savedSelectedChain && setSelectedChain(savedSelectedChain);
  }, [savedSelectedChain]);

  const chainOptions = useMemo(() => {
    const filteredOptions = options.filter((option) => option.value); // filter out the "Allow on any chain" option

    filteredOptions.unshift(DEFAULT_SELECTED_OPTION);

    return filteredOptions;
  }, [options]);

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

  const { grouped } = useTransactionHistory2(selectedAccount?.address, selectedChain as string | undefined, historyFilter);

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

  const handleSelectedChain = useCallback((value: number | string) => {
    selectedAccount && updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [selectedAccount.address]: value }).then(() => {
      setSelectedChain(value);
    }).catch(console.error);
  }, [selectedAccount]);
  const onBack = useCallback(() => onAction('/'), [onAction]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader />
      <BackWithLabel
        onClick={onBack}
        text={t('Transaction History')}
      />
      <HistoryTabs
        selectedChain={selectedChain}
        setTab={setTab}
        tab={tab}
      />
      {savedSelectedChain !== undefined &&
        <DropSelect
          defaultValue={savedSelectedChain ?? DEFAULT_SELECTED_OPTION.value}
          displayContentType='logo'
          onChange={handleSelectedChain}
          options={chainOptions}
          style={{
            margin: '12px 15px',
            width: 'calc(100% - 30px)'
          }}
          value={selectedChain}
        />}
      <Grid container item ref={scrollContainerRef} sx={{ height: 'fit-content', maxHeight: '400px', mt: '10px', overflowY: 'auto', pb: '60px' }}>
        <HistoryBox
          historyItems={historyItemsToShow}
          notReady={!selectedChain}
          style={{ margin: '10px 12px 15px', width: 'calc(100% - 24px)' }}
        />
      </Grid>
      <FadeOnScroll
        containerRef={scrollContainerRef}
      />
      <HomeMenu />
    </Container>
  );
}

export default History;
