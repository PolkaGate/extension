// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import Lock from './actions/Lock';
import Reload from './actions/Reload';
import ThemeChange from './actions/ThemeChange';

const style = {
  '&:hover': {
    bgcolor: '#2D1E4A'
  },
  bgcolor: '#05091C',
  borderRadius: '14px',
  height: '39px',
  mt: '2px',
  transition: 'background-color 0.3s ease',
  width: '110px'
};

export default function ActionRow (): React.ReactElement {
  return (
    <Grid container item>
      <Lock style={style} />
      <ThemeChange />
      <Reload style={style} />
    </Grid>
  );
}
