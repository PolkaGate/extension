// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, useTheme } from '@mui/material';
import React from 'react';

import { baseEffect } from '../assets/img';
import { logoMotionDark, logoMotionLight } from '../assets/logos';

export default function FlyingLogo(): React.ReactElement {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Grid
      alignItems='center'
      container
      justifyContent='center'
      sx={{
        '&::before': isDark
          ? {}
          : {
            background: 'radial-gradient(ellipse at center, rgba(255, 79, 185, 0.34) 0%, rgba(236, 180, 255, 0.26) 34%, rgba(213, 219, 240, 0) 72%)',
            content: '""',
            filter: 'blur(14px)',
            height: '58%',
            left: '50%',
            pointerEvents: 'none',
            position: 'absolute',
            top: '25%',
            transform: 'translateX(-50%)',
            width: '56%'
          },
        backgroundColor: isDark ? '#05091C' : '#D5DBF0',
        backgroundImage: isDark ? `url(${baseEffect})` : 'none',
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
          position: 'relative',
          width: '100%'
        }}
      />
    </Grid>
  );
}
