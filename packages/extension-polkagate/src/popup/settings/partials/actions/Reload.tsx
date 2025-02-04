// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import { Refresh2 } from 'iconsax-react';
import React from 'react';

export default function Reload (): React.ReactElement {
  return (
    <Grid alignItems='center' container item justifyContent='center' justifyItems='center' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '39px', mt: '2px', width: '110px' }}>
      <Refresh2 color='#AA83DC' size={18} variant='Bold' />
      <Typography color='text.primary' pl='2px' pt='4px' variant='B-4'>
        Reload
      </Typography>
    </Grid>
  );
}
