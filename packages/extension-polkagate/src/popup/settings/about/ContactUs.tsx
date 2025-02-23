// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { useIsDark } from '../../../hooks';
import AtSignIcon from '../icons/AtSign';

export default function ContactUs (): React.ReactElement {
  const isDark = useIsDark();
  const color = isDark ? 'rgba(190, 170, 216, 1)' : '#745D8B';

  return (
    <Stack direction='column'>
      <Typography
        color='label.secondary'
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left' }}
        variant='H-4'
      >
        CONTACT US
      </Typography>
      <Grid
        alignItems= 'center'
        columnGap='5px'
        container
        justifyContent={'flex-start'}
        pt='7px'
      >
        <AtSignIcon color={color} width='14px' />
        <Typography
          color={color}
          sx={{ textAlign: 'left' }}
          variant='B-1'
        >
          polkagate@support.xyz
        </Typography>
      </Grid>
    </Stack>
  );
}
