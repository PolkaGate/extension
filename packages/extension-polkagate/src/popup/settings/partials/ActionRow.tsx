// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid } from '@mui/material';
import React from 'react';

import Lock from './actions/Lock';
import Reload from './actions/Reload';
import ThemeChange from './actions/ThemeChange';

export default function ActionRow (): React.ReactElement {
  return (
    <Grid container item>
      <Lock />
      <ThemeChange />
      <Reload />
    </Grid>
  );
}
