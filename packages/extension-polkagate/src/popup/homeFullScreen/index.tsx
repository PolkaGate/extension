// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useContext, useMemo, useState } from 'react';

import { AccountContext } from '../../components';
import { useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';
import AccountItem from './partials/AccountItem';
import HomeMenu from './partials/HomeMenu';
import TotalBalancePieChart from './partials/TotalBalancePieChart';

export default function HomePageFullScreen(): React.ReactElement {
  useFullscreen();
  const theme = useTheme();
  const { hierarchy } = useContext(AccountContext);

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();

  const indexBgColor = useMemo(() => theme.palette.mode === 'light' ? '#DFDFDF' : theme.palette.background.paper, [theme.palette]);
  const contentBgColor = useMemo(() => theme.palette.mode === 'light' ? '#F1F1F1' : theme.palette.background.default, [theme.palette]);

  return (
    <Grid bgcolor={indexBgColor} container item justifyContent='center'>
      <FullScreenHeader
        _otherComponents={
          <HeaderComponents
            hideNumbers={hideNumbers}
            setHideNumbers={setHideNumbers}
          />
        }
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='space-around' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll', py: '40px' }}>
        <Grid container direction='column' item rowGap='20px' width='fit-content'>
          {hierarchy.map((account, index) => (
            <AccountItem
              account={account}
              hideNumbers={hideNumbers}
              key={index}
              quickActionOpen={quickActionOpen}
              setQuickActionOpen={setQuickActionOpen}
            />
          ))}
        </Grid>
        <Grid container direction='column' item rowGap='20px' width='fit-content'>
          <Grid container item width='fit-content'>
            <TotalBalancePieChart
              hideNumbers={hideNumbers}
            />
          </Grid>
          <Grid container item width='fit-content'>
            <HomeMenu />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
