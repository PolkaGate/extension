// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component 
 * */

import '@vaadin/icons';

import { Divider, Grid, IconButton, Theme, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { ShortAddress } from '../../components';
import { showAccount } from '../../messaging';

interface Props {
  accountName: string | undefined;
  address: string
  formatted: string
  isHidden: boolean | undefined;
  theme: Theme;
}

export default function AccountBrief({ accountName, address, formatted, isHidden, theme }: Props): React.ReactElement<Props> {
  const _toggleVisibility = useCallback(
    (): void => {
      address && showAccount(address, isHidden || false).catch(console.error);
    },
    [address, isHidden]
  );

  return (
    < >
      <Grid alignItems='center' container justifyContent='center' xs={12} pt='10px'>
        <Grid item sx={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Typography sx={{ fontSize: '36px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '36px' }}>
            {accountName}
          </Typography>
        </Grid>
        <span>
          <IconButton
            onClick={_toggleVisibility}
            sx={{ height: '15px', ml: '10px', my: '10px', p: 0, width: '24px' }}
          >
            <vaadin-icon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ height: '20px', color: `${theme.palette.secondary.light}` }} />
          </IconButton>
        </span>
      </Grid>
      <ShortAddress address={formatted} addressStyle={{ fontSize: '10px', fontWeight: 300, letterSpacing: '-0.015em' }} charsCount={0} showCopy />
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '15px' }} />
    </>
  );
}
