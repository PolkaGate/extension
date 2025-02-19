// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import type { ThemeOptions } from '@mui/material';

import { baseTheme } from './baseTheme';

export const lightTheme: ThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    menuIcon: { active: '#8299BD', hover: '#FF4FB9', selected: '#291443' },
    primary: { main: '#291443', light: '#838383', contrastText: '#F1F1F1' },
    secondary: { main: '#8F97B8', light: '#8299BD', contrastText: '#CCD2EA59' },
    support: { main: '#BCE2DB', contrastText: '#008080' },
    approval: { main: '#BA82A4', contrastText: '#DFCBD7' },
    aye: { main: '#008080' },
    nay: { main: '#FF5722' },
    error: { main: '#FF4FB9' },
    label: { main: '#FFFFFF' },
    background: { default: '#CCD2EA', paper: '#FFFFFF' },
    backgroundFL: { primary: '#DFDFDF', secondary: '#F1F1F1' },
    text: { primary: '#291443', secondary: '#8299BD;', disabled: '#747474' },
    action: { disabled: '#fff', disabledBackground: '#989898', focus: '#BA82A5' },
    success: { main: '#1F7720', light: '#46890C', contrastText: '#228B22' },
    warning: { main: '#FF002B' },
    divider: '#cecece'
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
  }
  // ,
  // typography: {
  //   allVariants: {
  //     fontWeight: 400,
  //     fontFamily: 'Roboto',
  //     letterSpacing: '-0.015em'
  //   }
  // }
};
