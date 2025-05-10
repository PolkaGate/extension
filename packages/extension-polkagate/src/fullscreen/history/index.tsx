// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterOptions } from '@polkadot/extension-polkagate/src/popup/history/useTransactionHistory2';
import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { Box, Pagination, PaginationItem, Stack, Typography } from '@mui/material';
import { ArrowLeft2, ArrowRight2, Firstline } from 'iconsax-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import ChainDropDown from '@polkadot/extension-polkagate/src/components/ChainDropDown';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { HistoryTabs } from '@polkadot/extension-polkagate/src/popup/history/newDesign';
import useTransactionHistory2 from '@polkadot/extension-polkagate/src/popup/history/useTransactionHistory2';
import { GOVERNANCE_CHAINS, STAKING_CHAINS } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountSelectionDropDown, GenesisHashOptionsContext } from '../../components';
import { useChainInfo, useSelectedAccount, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';
import HistoryBox from './HistoryBox';

export enum TAB {
  ALL = 'all',
  TRANSFERS = 'transfers',
  STAKING = 'staking',
  GOVERNANCE = 'governance'
}

const DEFAULT_SELECTED_OPTION: DropdownOption = { text: 'Select a chain', value: '' };
const ITEMS_PER_PAGE = 8;

function HistoryFs(): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const savedSelectedChain = useAccountSelectedChain(selectedAccount?.address);

  const [tab, setTab] = useState<TAB>(TAB.ALL);
  const [selectedChain, setSelectedChain] = useState<number | string>(DEFAULT_SELECTED_OPTION.value);
  const { decimal, token } = useChainInfo(selectedChain as string, true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    savedSelectedChain && setSelectedChain(savedSelectedChain);
  }, [savedSelectedChain]);

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

  const { allHistories, count } = useTransactionHistory2(selectedAccount?.address, savedSelectedChain as string | undefined, historyFilter);

  const historyItemsToShow = useMemo(() => {
    if (!allHistories) {
      return allHistories;
    }

    const result = allHistories.map((item) => {
      if (item.token === token) {
        return { ...item, decimal };
      }

      return undefined;
    }).filter((item) => !!item);

    if (result.length === 0) {
      return null;
    }

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return result.slice(start, end);
  }, [allHistories, page, token, decimal]);

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

  return (
    <HomeLayout>
      <Typography color='text.primary' sx={{ ml: '25px', textTransform: 'uppercase' }} variant='H-2'>
        {t('History')}
      </Typography>
      <HistoryTabs
        setTab={setTab}
        tab={tab}
        unSupportedTabs={tabsToFilter}
      />
      <VelvetBox style={{ margin: '20px 22px 15px', width: 'calc(100% - 24px)' }}>
        <Stack alignItems='center' direction='row' justifyContent='start' sx={{ border: '1px solid #BEAAD833', borderRadius: '12px', m: '12px 13px 4px', width: 'fit-content' }}>
          <AccountSelectionDropDown
            style={{ border: 'none', height: '42px', margin: '0', width: '180px' }}
          />
          <Box sx={{ background: 'linear-gradient(0deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)', height: '24px', width: '1px'}} />
          <ChainDropDown
            style={{ border: 'none', height: '42px', margin: '0', width: '250px' }}
            withSelectChainText={false}
          />
        </Stack>
        <HistoryBox
          historyItems={historyItemsToShow}
          notReady={!selectedChain}
        />
        {
          !!historyItemsToShow &&
          <Stack alignItems='center' direction='row' sx={{ p: '12px' }}>
            <Stack columnGap='5px' direction='row' sx={{ width: '25%' }}>
              <Firstline color='#674394' size='18px' variant='Bold' />
              <Typography color='#AA83DC' variant='B-4'>
                {`${(page - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(page * ITEMS_PER_PAGE, count)} of ${count} items`}
              </Typography>
            </Stack>
            <Pagination
              color='primary'
              page={page}
              onChange={(_, value) => setPage(value)}
              count={Math.ceil(count / ITEMS_PER_PAGE)}
              // eslint-disable-next-line react/jsx-no-bind
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  slots={{
                    next: () => <ArrowRight2 color='#AA83DC' size='16px' variant='Bold' />,
                    previous: () => <ArrowLeft2 color='#AA83DC' size='16px' variant='Bold' />
                  }}
                />
              )}
              shape='rounded'
              sx={{
                '& .MuiPaginationItem-root': {
                  backgroundColor: '#2D1E4A',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#AA83DC',
                  typography: 'B-6'
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
                  border: 'none',
                  color: '#fff'
                },
                '& .MuiPaginationItem-root.MuiPaginationItem-ellipsis': {
                  backgroundColor: 'transparent',
                  border: 'none'
                }
              }}
              variant='outlined'
            />
          </Stack>
        }
      </VelvetBox>
    </HomeLayout>
  );
}

export default React.memo(HistoryFs);
