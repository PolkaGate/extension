// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption, TransactionDetail } from '../../../util/types';

import { Container, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import useAccountSelectedChain, { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { updateStorage } from '@polkadot/extension-polkagate/src/util/index';

import { ActionContext, BackWithLabel, DropSelect, FadeOnScroll, GenesisHashOptionsContext } from '../../../components';
import { useChainInfo, useSelectedAccount, useTranslation } from '../../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../../partials';
import { GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';
import useTransactionHistory2, { type FilterOptions } from '../useTransactionHistory2';
import HistoryBox from './HistoryBox';

interface Props {
  setTab: React.Dispatch<React.SetStateAction<TAB>>;
  tab: TAB | undefined;
  unSupportedTabs: TAB[];
}

export enum TAB {
  ALL = 'all',
  TRANSFERS = 'transfers',
  STAKING = 'staking',
  GOVERNANCE = 'governance'
}

export function HistoryTabs ({ setTab, tab, unSupportedTabs }: Props): React.ReactElement {
  const { t } = useTranslation();

  const isSelected = useCallback((selectedTab: TAB | undefined) => tab === selectedTab, [tab]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: TAB) => {
    setTab(value);
  }, [setTab]);

  return (
    <Container disableGutters sx={{ display: 'flex', mx: '30px', width: '100%' }}>
      <Tabs
        onChange={handleTabChange}
        sx={{
          '& div.MuiTabs-flexContainer': {
            columnGap: '20px'
          },
          '& span.MuiTabs-indicator': {
            background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            borderRadius: '999px',
            height: '2px'
          },
          minHeight: 'unset'
        }}
        value={tab}
      >
        {Object.entries(TAB).filter(([_, value]) => !unSupportedTabs.includes(value)).map(([key, value]) => (
          <Tab
            key={key}
            label={
              <Typography color={isSelected(value) ? 'text.primary' : 'secondary.main'} textTransform='capitalize' variant='B-2'>
                {t(value)}
              </Typography>
            }
            sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
            value={value}
          />
        ))}
      </Tabs>
    </Container>
  );
}

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

  const tabsToFilter = useMemo(() => {
    const unsupportedTabs = [];

    if (!GOVERNANCE_CHAINS.includes(selectedChain as string)) {
      unsupportedTabs.push(TAB.GOVERNANCE);
    }

    if (!STAKING_CHAINS.includes(selectedChain as string)) {
      unsupportedTabs.push(TAB.STAKING);
    }

    return unsupportedTabs;
  }, [selectedChain]);

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
        setTab={setTab}
        tab={tab}
        unSupportedTabs={tabsToFilter}
      />
      {savedSelectedChain !== undefined &&
        <DropSelect
          defaultValue={savedSelectedChain ?? DEFAULT_SELECTED_OPTION.value}
          displayContentType='logo'
          onChange={handleSelectedChain}
          options={chainOptions}
          style={{
            mt: '12px',
            mx: '15px',
            width: 'calc(100% - 30px)'
          }}
          value={selectedChain}
        />}
      <Grid container item ref={scrollContainerRef} sx={{ height: 'fit-content', maxHeight: '405px', mt: '10px', overflow: 'scroll', pb: '60px' }}>
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
