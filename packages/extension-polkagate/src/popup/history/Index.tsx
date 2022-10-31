// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Grid, Tab, Tabs } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { ActionContext, Progress } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { getHistory } from '../../util/subquery/history';
import { SubQueryHistory } from '../../util/types';
import HistoryItem from './partials/HistoryItem';

interface ChainNameAddressState {
  chainName: string;
  formatted: string;
  decimal: string;
  token: string;
}

const TAB_MAP = {
  ALL: 1,
  TRANSFERS: 2,
  STAKING: 3
};

export default function TransactionHistory(): React.ReactElement<''> {
  const { t } = useTranslation();
  const history = useHistory();
  const { pathname, state } = useLocation();
  const { chainName, decimal, formatted, token } = useParams<ChainNameAddressState>();
  const [tabIndex, setTabIndex] = useState<number>(1);
  const [isRefreshing, setRefresh] = useState<boolean>(true);
  const [txHistory, setTxHistory] = useState<SubQueryHistory[] | undefined | null>();
  // const [groupedHistory, setGroupedHistory] = useState<Record<string, SubQueryHistory[]> | undefined>();
  const [filtered, setFiltered] = useState<SubQueryHistory[] | undefined>();

  const grouped = useMemo((): Record<string, SubQueryHistory[]> | undefined => {
    const list = (filtered && [...filtered]) || (txHistory && [...txHistory]);

    if (!list) {
      return undefined;
    }

    const temp = {};
    const options = { day: 'numeric', month: 'short', year: 'numeric' };

    list?.reverse()?.forEach((h) => {
      if (h.reward === null) {// to ignore reward history
        const day = new Date(parseInt(h.timestamp) * 1000).toLocaleDateString(undefined, options);

        if (!temp[day]) {
          temp[day] = [];
        }

        temp[day].push(h);
      }
    });

    return temp;
  }, [filtered, txHistory]);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    setTxHistory(null);
  }, []);

  useEffect(() => {
    chainName && formatted && isRefreshing && getHistory(chainName, formatted).then((res) => {
      setTxHistory(res ? [...res] : undefined);
      setRefresh(false);
    }
    ).catch(console.error);
  }, [formatted, chainName, isRefreshing]);

  console.log('groupedhistory:', grouped);

  const _onBack = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/'
    });
  }, [history, state?.pathname]);

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, tabIndex: number) => {
    setTabIndex(tabIndex);

    if (txHistory) {
      // filter history

      if (tabIndex === TAB_MAP.TRANSFERS) {
        return setFiltered(txHistory.filter((h) => h.id.includes('to') || h.id.includes('from')));
      }

      if (tabIndex === TAB_MAP.STAKING) {
        return setFiltered(txHistory.filter((h) => h.extrinsic?.module === 'staking' || h.extrinsic?.module === 'nominationPools'));
      }

      return setFiltered(undefined); // for the All tab
    }
  }, [txHistory]);

  return (
    <>
      <HeaderBrand
        isRefreshing={isRefreshing}
        onBackClick={_onBack}
        onRefresh={onRefresh}
        showBackArrow
        text={t<string>('Transaction History')}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'secondary.light' }}>
        <Tabs
          centered
          onChange={handleTabChange}
          sx={{
            'span.MuiTabs-indicator': {
              bgcolor: 'secondary.light',
              height: '4px'
            }
          }}
          value={tabIndex}
        >
          <Tab
            label={t<string>('All')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: '18px',
              fontWeight: 400,
              minWidth: '108px',
              textTransform: 'capitalize'
            }}
            value={1}
          />
          <Tab
            disabled
            icon={
              <Divider
                orientation='vertical'
                sx={{ backgroundColor: 'text.primary', height: '19px', mx: '5px', my: 'auto' }}
              />}
            label=''
            sx={{ minWidth: '1px', p: '0', width: '1px' }}
            value={4}
          />
          <Tab
            label={t<string>('Transfers')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: '18px',
              fontWeight: 400,
              minWidth: '108px',
              textTransform: 'capitalize'
            }}
            value={2}
          />
          <Tab
            disabled
            icon={
              <Divider
                orientation='vertical'
                sx={{ backgroundColor: 'text.primary', height: '19px', mx: '5px', my: 'auto' }}
              />}
            label=''
            sx={{ minWidth: '1px', p: '0', width: '1px' }}
            value={5}
          />
          <Tab
            label={t<string>('Staking')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: '18px',
              fontWeight: 400,
              minWidth: '108px',
              textTransform: 'capitalize'
            }}
            value={3}
          />
        </Tabs>
      </Box>
      {grouped
        ? <Grid container item sx={{ height: '70%', px: '15px', maxHeight: '470px', overflowY: 'auto' }} xs={12}>
          {Object.entries(grouped)?.map((group) => {
            const [date, info] = group;

            return info.map((h, index) => (
              <HistoryItem
                anotherDay={index === 0}
                chainName={chainName}
                date={date}
                decimal={Number(decimal)}
                info={h}
                key={index}
                path={pathname}
                token={token}
              />
            ));
          })}
        </Grid>
        : <Progress
          pt='150px'
          size={50}
          title={t('Loading history')}
        />
      }
    </>
  );
}
