// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerInformation } from '../components/SelectedProxy';

import { Container, Grid, Stack } from '@mui/material';
import React, { useMemo } from 'react';

import { HomeButton, SelectedProxy } from '../components';
import Notifications from '../fullscreen/components/layout/Notifications';
import AccountSelection from '../popup/home/partial/AccountSelection';
import FullscreenModeButton from './FullscreenModeButton';
import { ConnectedDapp } from '.';

interface Props {
  homeType?: 'default' | 'active';
  noSelection?: boolean;
  signerInformation?: SignerInformation;
  genesisHash?: string | null | undefined;
  fullscreenURL?: string;
}

function UserDashboardHeader ({ fullscreenURL, genesisHash, homeType, noSelection = false, signerInformation }: Props) {
  const isConnectedDapp = useMemo(() => document.getElementsByClassName('ConnectedDapp'), []);

  return (
    <Container disableGutters sx={{ display: 'flex', justifyContent: 'space-between', p: '10px 15px' }}>
      <Grid columnGap='6px' container item width='fit-content'>
        <Grid container item width='fit-content'>
          <HomeButton type={homeType || (isConnectedDapp.length ? 'default' : 'active')} />
          {
            !noSelection &&
            <ConnectedDapp />
          }
        </Grid>
        {
          !noSelection &&
          <AccountSelection noSelection={noSelection} /> /** Should not display the selected account while the selected proxy account is being shown. */
        }
        {
          signerInformation?.selectedProxyAddress && genesisHash &&
          <SelectedProxy genesisHash={genesisHash} signerInformation={signerInformation} />
        }
      </Grid>
      <Stack direction='row' sx={{ alignItems: 'center', gap: '4px', width: 'fit-content' }}>
        <Notifications />
        <FullscreenModeButton url={fullscreenURL} />
      </Stack>
    </Container>
  );
}

export default UserDashboardHeader;
