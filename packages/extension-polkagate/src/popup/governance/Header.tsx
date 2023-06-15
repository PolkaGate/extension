// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { useParams } from 'react-router';

import { logoBlack, logoWhite } from '../../assets/logos';
import { ActionContext } from '../../components';
import { useApi, useChain } from '../../hooks';
import { ChainSwitch } from '../../partials';
import { EXTENSION_NAME } from '../../util/constants';
import AddressDropdown from './components/AddressDropdown';
import { MAX_WIDTH } from './utils/consts';

export function Header(): React.ReactElement {
  const theme = useTheme();
  const { address, postId, topMenu } = useParams<{ address: string, topMenu: 'referenda' | 'fellowship', postId?: string }>();

  const api = useApi(address);
  const chain = useChain(address);
  const onAction = useContext(ActionContext);

  const onAccountChange = useCallback((address: string) =>
    onAction(`/governance/${address}/${topMenu}/${postId || ''}`)
    , [onAction, postId, topMenu]);

  return (
    <Grid alignItems='center' container id='header' justifyContent='space-between' sx={{ bgcolor: 'black', color: 'text.secondary', fontSize: '42px', fontWeight: 400, height: '70px' }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid alignItems='center' container item justifyContent='flex-start' sx={{ color: 'white', fontFamily: 'Eras' }} xs={6}>
            <Box
              component='img'
              src={theme.palette.mode === 'light' ? logoBlack as string : logoWhite as string}
              sx={{ height: 50, mr: '1%', width: 50 }}
            />
            {EXTENSION_NAME}
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' sx={{ color: 'text.primary' }} xs={6}>
            <Grid container item justifyContent='flex-end' sx={{ color: 'text.primary', maxWidth: 'calc(100% - 50px)', pr: '8px', width: 'fit-content' }}>
              <AddressDropdown
                api={api}
                chainGenesis={chain?.genesisHash}
                height='40px'
                onSelect={onAccountChange}
                selectedAddress={address}
              />
            </Grid>
            <Grid container item justifyContent='flex-end' width='50px'>
              <ChainSwitch address={address} invert />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
