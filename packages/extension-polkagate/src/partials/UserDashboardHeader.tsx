// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container } from '@mui/material';
import React from 'react';

import { HomeButton } from '../components';
import AccountSelection from '../popup/home/partial/AccountSelection';
import FullscreenModeButton from './FullscreenModeButton';

function UserDashboardHeader () {
  return (
    <Container disableGutters sx={{ display: 'flex', justifyContent: 'space-between', p: '10px 15px' }}>
      <HomeButton type='active' />
      <AccountSelection />
      <FullscreenModeButton />
    </Container>
  );
}

export default UserDashboardHeader;
