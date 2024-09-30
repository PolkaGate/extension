// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Skeleton } from '@mui/material';
import React from 'react';

export default function ItemSkeleton (): React.ReactElement {
  return (
    <Grid container item sx={{ '> span': { transform: 'scale(1, 1)' }, bgcolor: 'divider', border: '1px solid', borderColor: 'divider', borderRadius: '10px', height: '320px', width: '190px' }}>
      <Skeleton animation='wave' sx={{ borderRadius: '10px 10px 5px 5px', height: '220px', width: '100%' }} />
      <Skeleton animation='wave' sx={{ borderRadius: '5px', height: '17px', mx: 'auto', my: '5px', width: '90px' }} />
      <Skeleton animation='wave' sx={{ borderRadius: '5px', height: '17px', mx: 'auto', width: '110px' }} />
      <Skeleton animation='wave' sx={{ borderRadius: '5px', height: '17px', mx: 'auto', width: '110px' }} />
    </Grid>
  );
}
