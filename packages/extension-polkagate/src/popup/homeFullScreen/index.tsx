// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext } from '../../components';
import { useFullscreen } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import HeaderComponents from './components/HeaderComponents';
import AccountItem from './partials/AccountItem';

export default function HomePageFullScreen(): React.ReactElement {
  useFullscreen();
  const theme = useTheme();
  const { accounts, hierarchy } = useContext(AccountContext);

  const [hideNumbers, setHideNumbers] = useState<boolean>();

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

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
      <Grid container item justifyContent='space-around' sx={{ bgcolor: contentBgColor, height: 'calc(100vh - 70px)', maxWidth: '1282px', py: '40px', overflow: 'scroll' }}>
        <Grid container direction='column' item rowGap='20px' width='fit-content'>
          {hierarchy.map((acc, index) => (
            <AccountItem
              account={acc}
              key={index}
            />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
