// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows a subtitle beneath the header
 * */

import '@vaadin/icons';

import { Divider, Grid } from '@mui/material';
import React from 'react';

interface Props {
  label: string;
}

export default function SubTitle({ label }: Props) {
  return (
    <Grid
      container
      direction='column'
      item
      justifyContent='center'
      sx={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.015em', lineHeight: '25px', px: '5px' }}
    >
      <Grid
        item
        sx={{ m: 'auto' }}
      >
        {label}
      </Grid>
      <Grid item>
        <Divider
          sx={{ bgcolor: 'secondary.main', height: '2px', width: '138px', margin: 'auto' }}
        />
      </Grid>
    </Grid>
  );
}
