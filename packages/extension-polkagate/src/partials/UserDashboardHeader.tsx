// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import React, { useMemo } from 'react';

import { HomeButton } from '../components';
import AccountSelection from '../popup/home/partial/AccountSelection';
import FullscreenModeButton from './FullscreenModeButton';
import { ConnectedDapp } from '.';

function UserDashboardHeader () {
  const isConnectedDapp = useMemo(() => document.getElementsByClassName('ConnectedDapp'), []);

  return (
    <Container disableGutters sx={{ display: 'flex', justifyContent: 'space-between', p: '10px 15px' }}>
      <Grid columnGap='6px' container item width='fit-content'>
        <Grid container item width='fit-content'>
          <HomeButton type={isConnectedDapp.length ? 'default' : 'active'} />
          <ConnectedDapp />
        </Grid>
        <AccountSelection />
      </Grid>
      <FullscreenModeButton />
    </Container>
  );
}

export default UserDashboardHeader;
