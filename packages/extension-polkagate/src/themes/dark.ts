// Copyright 2019-2022 @polkadot/polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable sort-keys */

import { ThemeOptions } from '@mui/material';

import { baseTheme } from './baseTheme';

export const darkTheme: ThemeOptions = {
  ...baseTheme,

  palette: {
    mode: 'dark',
    primary: { main: '#99004F' },
    secondary: { main: '#BA2882', light: '#BA2682' },
    background: { default: '#180710', paper: '#000000' },
    text: { primary: '#FFFFFF', secondary: '#000000', disabled: '#4B4B4B' },
    action: { disabled: '#fff', disabledBackground: '#4B4B4B', focus: '#BA82A5' },
    success: { main: '#46890C' },
    warning: { main: '#FF002B' }
  },
  components: {
    MuiSkeleton: {
      styleOverrides:
      {
        root: {
          backgroundColor: 'grey.800'
        }
      }
    }
  },
  typography: {
    allVariants: {
      fontWeight: 300,
      fontFamily: 'Roboto'
    }
  }
};
