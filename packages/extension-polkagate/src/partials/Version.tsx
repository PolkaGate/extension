// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { useManifest } from '../hooks';

export default function Version (): React.ReactElement {
  const version = useManifest()?.version;

  return (
    <Grid alignItems='center' container item justifyContent='center'>
      <Typography color='#674394' fontFamily='Inter' fontSize='13px' fontWeight={500} lineHeight='18.2px' pt='8px' textAlign='center'>
        {'v.'}{version}
      </Typography>
    </Grid>
  );
}
