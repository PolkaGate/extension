// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Divider, Tab, Tabs } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import Detail from './Detail';
import HistoryItem from './HistoryItem';

export default function TransactionHistory(): React.ReactElement<''> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [tabIndex, setTabIndex] = useState<number>(1);

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
            sx={{ p: '0', minWidth: '1px', width: '1px' }}
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
      <div style={{ margin: 'auto', width: '92%' }}>
        <HistoryItem />
      </div>
      {/* un comment the following line to see the Detail page */}
      {/* <Detail /> */}
    </>
  );
}
