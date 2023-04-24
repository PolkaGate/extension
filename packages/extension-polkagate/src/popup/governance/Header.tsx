// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, useTheme } from '@mui/material';
import React from 'react';

import { logoBlack, logoWhite } from '../../assets/logos';
import { useApi, useChain } from '../../hooks';
import { ChainSwitch } from '../../partials';
import { MAX_WIDTH } from './utils/consts';
import AddressDropdown from './AddressDropdown';

interface Props {
  address: string | undefined;
  onAccountChange: (address: string) => void
}

export function Header({ address, onAccountChange }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);

  return (
    <Grid alignItems='center' container id='header' justifyContent='space-between' sx={{ bgcolor: '#180710', height: '70px', color: 'text.secondary', fontSize: '42px', fontWeight: 400 }}>
      <Container disableGutters sx={{ maxWidth: MAX_WIDTH }}>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid alignItems='center' container item justifyContent='flex-start' sx={{ fontFamily: 'Eras' }} xs={6}>
            <Box
              component='img'
              src={theme.palette.mode === 'light' ? logoBlack as string : logoWhite as string}
              sx={{ height: 50, mr: '1%', width: 50 }}
            />
            Polkagate
          </Grid>
          <Grid alignItems='center' container item justifyContent='flex-end' spacing={1} sx={{ color: 'text.primary' }} xs>
            <Grid item justifyContent='flex-end' sx={{ color: 'text.primary' }}>
              <AddressDropdown
                api={api}
                chainGenesis={chain?.genesisHash}
                height='40px'
                onSelect={onAccountChange}
                selectedAddress={address}
              />
            </Grid>
            <Grid item justifyContent='flex-end'>
              <ChainSwitch address={address} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
