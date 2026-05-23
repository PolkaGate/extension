// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
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
    border: { default: '#05091C', input: '#BEAAD833', paper: '#1B133C', strong: '#2D1E4A', subtle: '#FFFFFF0D' },
    backgroundFL: { primary: '#1B133C', secondary: '#171717' },
    accent: { highlight: '#AA83DC', icon: '#AA83DC', text: '#BEAAD8', textStrong: '#BEAAD8' },
    surface: { badge: '#05091C80', disabled: '#1B133C', hover: '#2D1E4A', input: '#05091C', panel: '#1B133C', panelAlt: '#110F2A', popover: '#1B133C', selected: '#2D1E4A' },
    text: { primary: '#EAEBF1', secondary: '#BEAAD8', disabled: '#4B4B4B', highlight: '#809ACB', muted: '#7956A5' },
    action: { disabled: '#fff', disabledBackground: '#4B4B4B', focus: '#BA82A5' },
    shadow: { card: 'none', popover: 'none' },
    skeleton: { accent: '#BEAAD840', default: '#946CC840', muted: '#946CC826', subtle: '#B094D340' },
    success: { main: '#82FFA5', light: '#46890C', contrastText: '#2ECC71' },
    warning: { main: '#FF4FB9', light: '#FFCE4F' },
    divider: 'rgba(255, 255, 255, 0.1)',
    dividerGradient: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)',
    gradient: {
      brand: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
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
