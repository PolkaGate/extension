// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { docs, web } from '../icons';
import SocialIcon from './SocialIcon';

export default function Resources (): React.ReactElement {
  return (
    <Stack direction='column'>
      <Typography
        color='rgba(190, 170, 216, 1)'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'>
        RESOURCES
      </Typography>
      <Grid columnGap='8px' container justifyContent={'flex-start'}>
        <SocialIcon icon={docs as string} link='https://docs.polkagate.xyz/' />
        <SocialIcon icon={web as string} link='https://polkagate.xyz/' />
      </Grid>
    </Stack>
  );
}
