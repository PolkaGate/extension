// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

interface Props {
  caption: string;
  value: any | React.ReactNode | string | undefined;
  showDivider?: boolean;
  fontSize?: string;
  fontWeight?: number;
}

export default function DisplayInfo({ caption, fontSize = '16px', fontWeight = 400, showDivider = true, value }: Props) {
  return (
    <Grid alignItems='center' container direction='column' fontSize={fontSize} fontWeight={fontWeight} justifyContent='center'>
      <Grid container item width='fit-content'>
        <Typography lineHeight='40px' pr='5px'>
          {caption}
        </Typography>
        <Typography lineHeight='40px'>
          {value || ''}
        </Typography>
      </Grid>
      {showDivider &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
        </Grid>}
    </Grid>
  );
}
