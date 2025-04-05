// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Grid, Typography } from '@mui/material';
import React from 'react';

import { useManifest } from '../hooks';

export default function Version (): React.ReactElement {
  const version = useManifest()?.version;

  return (
    <Grid alignItems='center' container item justifyContent='center'>
      <Typography color='#674394' pt='8px' variant='B-1'>
        {'v.'}{version}
      </Typography>
    </Grid>
  );
}
