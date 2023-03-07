// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows ..
 * */

import type { ApiPromise } from '@polkadot/api';

import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useChain, useFormatted } from '../hooks';
import { Identity, ShortAddress } from '.';
import { getSubstrateAddress } from '../util/utils';


interface Props {
  address?: string;
  api: ApiPromise | undefined;
  formatted?: string;
  style?: SxProps<Theme> | undefined;
  title: string;
}

function From({ address, api, formatted, style, title }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const chain = useChain(formatted || address);
  const _formatted = useFormatted(address);
  const _address = address || getSubstrateAddress(formatted);

  return (
    <Grid container item sx={style}>
      <Typography style={{ fontSize: '16px', fontWeight: 300 }}>
        {title}
      </Typography>
      <Grid alignItems='center' container justifyContent='flex-start' sx={{ border: 1, borderColor: 'primary.main', borderRadius: '5px', background: `${theme.palette.background.paper}`, py: '5px', mt: '2px' }}>
        <Grid item sx={{ fontSize: '28px', fontWeight: 400, maxWidth: '67%' }}>
          <Identity address={_address} api={api} chain={chain} formatted={formatted || _formatted} identiconSize={31} showSocial={false} />
        </Grid>
        <Grid item sx={{ width: '30%', pl: '5px' }}>
          <ShortAddress address={formatted || _formatted || _address} style={{ fontSize: '16px', fontWeight: 300, justifyContent: 'flex-start', mt: '5px' }} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(From);
