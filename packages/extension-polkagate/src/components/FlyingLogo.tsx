// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, useTheme } from '@mui/material';
import React from 'react';

import { baseEffect } from '../assets/img';
import { logoMotionDark, logoMotionLight } from '../assets/logos';

export default function FlyingLogo(): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid
      alignItems='center'
      container
      justifyContent='center'
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#05091C' : '#fff', // covers any inherited background
        backgroundImage: `url(${baseEffect})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        height: '100vh',
        left: 0,
        position: 'fixed',
        top: 0,
        width: '100vw',
        zIndex: 9999
      }}
    >
      <Box
        component='img'
        src={theme.palette.mode === 'dark' ? logoMotionDark as string : logoMotionLight as string}
        sx={{
          height: 'fit-content',
          maxWidth: '1100px',
          width: '100%'
        }}
      />
    </Grid>
  );
}
