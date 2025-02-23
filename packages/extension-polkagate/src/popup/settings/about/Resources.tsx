// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useIsDark } from '../../../hooks';
import { Docs, Web } from '../icons';
import SocialIcon from '../partials/SocialIcon';

export default function Resources (): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();

  return (
    <Stack direction='column'>
      <Typography
        color='label.secondary'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'>
        RESOURCES
      </Typography>
      <Grid columnGap='8px' container justifyContent={'flex-start'}>
        <SocialIcon bgColor ={isDark ? undefined : '#CCD2EA'} Icon={<Docs color={theme.palette.icon.secondary} width='18px' />} link='https://docs.polkagate.xyz/' />
        <SocialIcon bgColor ={isDark ? undefined : '#CCD2EA'} Icon={<Web color={theme.palette.icon.secondary} width='18px' />} link='https://polkagate.xyz/' />
      </Grid>
    </Stack>
  );
}
