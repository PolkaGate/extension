// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component 
 * */

import '@vaadin/icons';

import { Divider, Grid, IconButton, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { ShortAddress } from '../../components';
import { useAccount, useFormatted } from '../../hooks';
import { showAccount } from '../../messaging';

interface Props {
  address: string
}

export default function AccountBrief({ address }: Props): React.ReactElement<Props> {
  const formatted = useFormatted(address);
  const account = useAccount(address);
  const theme = useTheme();

  const _toggleVisibility = useCallback(
    (): void => {
      address && showAccount(address, account?.isHidden || false).catch(console.error);
    },
    [address, account?.isHidden]
  );

  return (
    < >
      <Grid alignItems='center' container justifyContent='center' xs={12}>
        <Typography sx={{ fontSize: '36px', fontWeight: 400, height: '50px', letterSpacing: '-0.015em', maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {account?.name}
        </Typography>
        <span>
          <IconButton
            onClick={_toggleVisibility}
            sx={{ height: '15px', ml: '10px', mt: '5px', p: 0, width: '24px' }}
          >
            <vaadin-icon icon={account?.isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ height: '20px', color: `${theme.palette.secondary.light}` }} />
          </IconButton>
        </span>
      </Grid>
      <ShortAddress address={formatted} charsCount={0} showCopy style={{ fontSize: '10px', fontWeight: 300}} />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '10px' }} />
    </>
  );
}
