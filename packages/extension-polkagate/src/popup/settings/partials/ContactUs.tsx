// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { atSign } from '../icons';

export default function ContactUs (): React.ReactElement {
  return (
    <Stack direction='column'>
      <Typography
        color='rgba(190, 170, 216, 1)'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'
      >
        CONTACT US
      </Typography>
      <Grid
        columnGap='8px'
        container
        justifyContent={'flex-start'}
        pt='7px'
      >
        <Box
          component='img'
          src={atSign as string}
          sx={{ width: '14px' }}
        />
        <Typography
          color='rgba(190, 170, 216, 1)'
          sx={{ textAlign: 'left' }}
          variant='B-1'
        >
          polkagate@support.xyz
        </Typography>
      </Grid>
    </Stack>
  );
}
