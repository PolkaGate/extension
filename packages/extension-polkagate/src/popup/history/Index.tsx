// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Grid, Tab, Tabs } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext, Progress } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { getHistory } from '../../util/subquery/history';
import { SubQueryHistory } from '../../util/types';
import HistoryItem from './HistoryItem';
import { useLocation } from 'react-router-dom';

interface ChainNameAddressState {
  chainName: string;
  formatted: string;
  decimals: string;
  token: string;
}

export default function TransactionHistory(): React.ReactElement<''> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const location = useLocation();

  const { chainName, decimals, formatted, token } = useParams<ChainNameAddressState>();

  const [tabIndex, setTabIndex] = useState<number>(1);
  const [history, setHistory] = useState<Record<string, SubQueryHistory[]> | undefined>();

  useEffect(() => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };

    chainName && formatted && getHistory(chainName, formatted).then((history) => {
      const temp = {};

      history?.forEach((h) => {
        if (h.reward === null) {// to ingonre reward history
          const day = new Date(parseInt(h.timestamp) * 1000).toLocaleDateString(undefined, options);

          if (!temp[day]) {
            temp[day] = [];
          }

          temp[day].push(h);
        }
      });

      setHistory(temp);
      console.log('grouped history:', temp);
    }
    ).catch(console.error);
  }, [formatted, chainName]);

  const _onBack = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, tabIndex: number) => {
    if (history) {
      // filter history
    }
    setTabIndex(tabIndex);
  }, [history]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBack}
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
            sx={{ p: '0', minWidth: '1px', width: '1px' }}
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
      {history
        ? <Grid container item sx={{ height: '70%', px: '15px', maxHeight: '470px', overflowY: 'auto' }} xs={12}>
          {Object.entries(history)?.map((group) => {
            const [date, info] = group;

            return info.map((h, index) => (
              <HistoryItem
                anotherDay={index === 0}
                date={date}
                decimals={Number(decimals)}
                info={h}
                key={index}
                path={location?.pathname}
                token={token}
                chainName={chainName}
              />
            ));
          })}
        </Grid>
        : <Progress pt='150px'
          size={50}
          title={t('Loading history')}
        />
      }
    </>
  );
}
