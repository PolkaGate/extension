// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

import type { ExtendedThemeOptions } from './dark';

import { baseTheme } from './baseTheme';

export const lightTheme: ExtendedThemeOptions = {
  ...baseTheme,
  palette: {
    mode: 'light',
    menuIcon: { active: '#9AA8CC', hover: '#FF4FB9', selected: '#4F4779' },
    primary: { main: '#4F4779', light: '#9EA6C3', contrastText: '#F8F8FF' },
    secondary: { main: '#8F97B8', light: '#A9B5D4', contrastText: '#DDE3F659' },
    support: { main: '#BCE2DB', contrastText: '#008080' },
    approval: { main: '#BA82A4', contrastText: '#DFCBD7' },
    aye: { main: '#008080' },
    nay: { main: '#FF5722' },
    error: { main: '#FF4FB9' },
    icon: { primary: '#FFFFFF', secondary: '#4F4779' },
    label: { primary: '#FFFFFF', secondary: '#4F4779' },
    background: { default: '#D8DDF1', paper: '#FFFFFF' },
    backgroundFL: { primary: '#EEF0FB', secondary: '#F8F9FF' },
    border: { default: '#C7D0EA', input: '#DDE3F4', paper: '#EEF0FB', strong: '#DDE3F4', subtle: '#E3E8F7' },
    accent: { icon: '#745D8B', text: '#745D8B', textStrong: '#745E9F' },
    surface: { badge: '#FFFFFF', disabled: '#EFF1F9', hover: '#F3F6FD', input: '#FFFFFF', panel: '#F8F9FF', panelAlt: '#EEF1FF', popover: '#FFFFFF', selected: '#EEF2FB' },
    text: { primary: '#31285A', secondary: '#7B84AC', disabled: '#A6ADC7', highlight: '#4A86F7', muted: '#7B84AC' },
    action: { disabled: '#FFFFFF', disabledBackground: '#B7C4E8', focus: '#D7B3E0' },
    shadow: { card: '0 12px 24px rgba(133, 140, 176, 0.12)', popover: '0 10px 24px rgba(133, 140, 176, 0.14)' },
    skeleton: { accent: '#E4EAF9', default: '#E4EAF9', muted: '#99A1C459', subtle: '#99A1C440' },
    success: { main: '#14B874', light: '#DDF8EA', contrastText: '#14B874' },
    warning: { main: '#FF8A3D' },
    divider: '#D8DDF1',
    dividerGradient: 'linear-gradient(90deg, rgba(221, 227, 244, 0.1) 0%, rgba(221, 227, 244, 0.9) 50.06%, rgba(221, 227, 244, 0.1) 100%)',
    gradient: {
      primary: `radial-gradient(circle at 22% 8%, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 22%),
        radial-gradient(circle at 56% 2%, rgba(248, 194, 255, 0.95) 0%, rgba(248, 194, 255, 0) 30%),
        radial-gradient(circle at 65% 18%, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0) 18%),
        linear-gradient(180deg, #E7E4F8 0%, #D8DDF1 100%)`,
      secondary: 'linear-gradient(180deg, #FFFFFF 0%, #F5F6FF 100%)'
    }
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
};
