// Copyright 2019-2022 @polkadot/polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeOptions } from '@mui/material';

import { baseTheme } from './baseTheme';

export const lightTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: { main: '#99004F' },
    secondary: { main: '#99004F', light: '#BA2882' },
    background: { default: '#E8E0E5', paper: '#fff' },
    text: { primary: '#000', secondary: '#FFFFFF' },
    action: { disabled: '#fff', disabledBackground: '#989898', focus: '#BA82A5' },
    success: { main: '#1F7720' },
    warning: { main: '#FF002B' }
  },
  components: {
    MuiSkeleton: {
      styleOverrides:
      {
        root: {
          backgroundColor: 'grey.200'
        }
      }
    }
  },
  typography: {
    allVariants: {
      fontWeight: 400,
      fontFamily: 'Roboto'
    }
  }
};
