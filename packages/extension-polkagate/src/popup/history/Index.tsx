// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Grid, Tab, Tabs } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { getHistory } from '../../util/subquery/history';
import { SubQueryHistory } from '../../util/types';
import Detail from './Detail';
import HistoryItem from './HistoryItem';

interface ChainNameAddressState {
  chainName: string;
  address: string;
}

export default function TransactionHistory(): React.ReactElement<''> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address, chainName } = useParams<ChainNameAddressState>();

  const [tabIndex, setTabIndex] = useState<number>(1);
  const [history, setHistory] = useState<SubQueryHistory[] | undefined>();


  useEffect(() => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };

    chainName && address && getHistory(chainName, address).then((history) => {
      history?.forEach((h) => {
        h.timestamp = new Date(parseInt(h.timestamp) * 1000).toLocaleDateString(undefined, options);
      });
      setHistory(history);

      console.log('history:', history);
    }
    ).catch(console.error);
  }, [address, chainName]);

  const _onBack = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, tabIndex: number) => {
    setTabIndex(tabIndex);
  }, []);

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
      <Grid container item  sx={{  height:'70%' }} xs={12}>
        {history?.map((h, index) => {
          return (
            <HistoryItem info={h} key={index} anotherDay={index === 0 || (index > 0 && history[index - 1].timestamp !== h.timestamp)} />
          )
        })}
      </Grid>
      {/* un comment the following line to see the Detail page */}
      {/* <Detail /> */}
    </>
  );
}
