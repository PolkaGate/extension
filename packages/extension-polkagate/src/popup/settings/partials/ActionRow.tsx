// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React from 'react';

import { useIsDark } from '../../../hooks/index';
import Lock from './actions/Lock';
import Reload from './actions/Reload';
import ThemeChange from './actions/ThemeChange';

export default function ActionRow (): React.ReactElement {
  const isDark = useIsDark();

  const style = {
    '&:hover': {
      bgcolor: isDark ? '#2D1E4A' : '#CCD2EA80'
    },
    bgcolor: 'background.paper',
    borderRadius: '16px',
    cursor: 'pointer',
    height: '39px',
    mt: '2px',
    transition: 'background-color 0.3s ease',
    width: '110px'
  };

  return (
    <Grid container item justifyContent='space-between'>
      <Lock style={style} />
      <ThemeChange />
      <Reload style={style} />
    </Grid>
  );
}
