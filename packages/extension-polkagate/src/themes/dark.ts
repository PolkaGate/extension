// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */
/* eslint-disable sort-keys */

import type { ThemeOptions, TypeText } from '@mui/material';

import { baseTheme } from './baseTheme';

declare module '@mui/material/styles' {
  interface Palette {
    aye: Palette['primary'];
    nay: Palette['primary'];
    label: Palette['primary'];
    approval: Palette['primary'];
    support: Palette['primary'];
    backgroundFL: TypeText;
  }
  interface PaletteOptions {
    approval?: PaletteOptions['primary'];
    aye?: PaletteOptions['primary'];
    nay?: PaletteOptions['primary'];
    label?: PaletteOptions['primary'];
    support?: PaletteOptions['primary'];
    backgroundFL?: Partial<TypeText>;
  }
}
export const darkTheme: ThemeOptions = {
  ...baseTheme,

  palette: {
    mode: 'dark',
    primary: { main: '#99004F', light: '#838383', contrastText: '#212121' },
    secondary: { main: '#BA2882', light: '#8D94A4', contrastText: '#747474' },
    support: { main: '#BCE2DB', contrastText: '#008080' },
    approval: { main: '#BA82A4', contrastText: '#DFCBD7' },
    aye: { main: '#008080' },
    nay: { main: '#FF5722' },
    label: { main: '#63364D' },
    background: { default: '#171717', paper: '#000000' },
    backgroundFL: { primary: '#000000', secondary: '#171717' },
    text: { primary: '#D5D5D5', secondary: '#000000', disabled: '#4B4B4B' },
    action: { disabled: '#fff', disabledBackground: '#4B4B4B', focus: '#BA82A5' },
    success: { main: '#1F7720', light: '#46890C', contrastText: '#2ECC71' },
    warning: { main: '#FF002B' },
    divider: 'rgba(255, 255, 255, 0.1)'
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
      fontFamily: 'Roboto',
      letterSpacing: '-0.015em'
    }
  }
};
