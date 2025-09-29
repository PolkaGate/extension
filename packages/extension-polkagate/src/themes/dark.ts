// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */
/* eslint-disable sort-keys */

import type { ThemeOptions } from '@mui/material';

import { baseTheme } from './baseTheme';

export interface ExtendedThemeOptions extends ThemeOptions {
  palette: NonNullable<ThemeOptions['palette']> & {
    text: NonNullable<ThemeOptions['palette']>['text'] & {
      highlight: string; // New property for staking
    };
  };
}

export const darkTheme: ExtendedThemeOptions = {
  ...baseTheme,

  palette: {
    mode: 'dark',
    menuIcon: { active: '#AA83DC', hover: '#FF4FB9', selected: '#EAEBF1' },
    primary: { main: '#AA83DC', light: '#838383', contrastText: '#212121' },
    secondary: { main: '#AA83DC', light: '#AA83DC', contrastText: '#C6AECC26' },
    support: { main: '#BCE2DB', contrastText: '#008080' },
    approval: { main: '#BA82A4', contrastText: '#DFCBD7' },
    aye: { main: '#008080' },
    nay: { main: '#FF5722' },
    icon: { primary: '#674394', secondary: '#AA83DC' },
    label: { primary: '#674394', secondary: '#BEAAD8' },
    error: { main: '#FF4FB9' },
    background: { default: '#05091C', paper: '#05091C' },
    border: { default: '#05091C', paper: '#1B133C' },
    backgroundFL: { primary: '#1B133C', secondary: '#171717' },
    text: { primary: '#EAEBF1', secondary: '#BEAAD8', disabled: '#4B4B4B', highlight: '#809ACB' },
    action: { disabled: '#fff', disabledBackground: '#4B4B4B', focus: '#BA82A5' },
    success: { main: '#82FFA5', light: '#46890C', contrastText: '#2ECC71' },
    warning: { main: '#FF4FB9', light: '#FFCE4F' },
    divider: 'rgba(255, 255, 255, 0.1)',
    gradient: {
      primary: `radial-gradient(
        circle at 95% 19%, 
        rgba(91, 0, 182, 0.35) 2%, 
        transparent 40%
      ),
      radial-gradient(
        circle at 4% 19%, 
        rgba(91, 0, 182, 0.35) 2%, 
        transparent 40%
      ),
      radial-gradient(
        circle at 45% 8%,
        rgba(255, 26, 177, 0.5) -2%,
        transparent 40%
      )`,
      secondary: 'linear-gradient(to bottom, #000000, #171717)'
    }
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
  }
};
