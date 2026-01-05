// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */

import type { ThemeOptions, TypeAction, TypeBackground } from '@mui/material';
import type { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface TypeText {
    highlight: string;
  }
  interface Palette {
    approval: Palette['primary'];
    aye: Palette['primary'];
    backgroundFL: TypeText;
    border: Partial<TypeBackground>;
    gradient: TypeText;
    icon: Partial<TypeText>;
    label: Partial<TypeText>;
    menuIcon: TypeAction;
    nay: Palette['primary'];
    support: Palette['primary'];
  }
  interface PaletteOptions {
    approval?: PaletteOptions['primary'];
    aye?: PaletteOptions['primary'];
    backgroundFL?: Partial<TypeText>;
    border?: Partial<TypeBackground>;
    icon?: Partial<TypeText>;
    gradient?: Partial<TypeText>;
    label?: Partial<TypeText>;
    menuIcon?: Partial<TypeAction>;
    nay?: PaletteOptions['primary'];
    support?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    'H-1': CSSProperties;
    'H-2': CSSProperties;
    'H-3': CSSProperties;
    'H-4': CSSProperties;
    'H-5': CSSProperties;
    'B-1': CSSProperties;
    'B-2': CSSProperties;
    'B-3': CSSProperties;
    'B-4': CSSProperties;
    'B-5': CSSProperties;
    'B-6': CSSProperties;
    'S-1': CSSProperties;
    'S-2': CSSProperties;
  }

  interface TypographyVariantsOptions {
    'H-1': CSSProperties;
    'H-2': CSSProperties;
    'H-3': CSSProperties;
    'H-4': CSSProperties;
    'H-5': CSSProperties;
    'B-1': CSSProperties;
    'B-2': CSSProperties;
    'B-3': CSSProperties;
    'B-4': CSSProperties;
    'B-5': CSSProperties;
    'B-6': CSSProperties;
    'S-1': CSSProperties;
    'S-2': CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    'H-1': true;
    'H-2': true;
    'H-3': true;
    'H-4': true;
    'H-5': true;
    'B-1': true;
    'B-2': true;
    'B-3': true;
    'B-4': true;
    'B-5': true;
    'B-6': true;
    'S-1': true;
    'S-2': true;
  }
}

export const baseTheme: ThemeOptions = {
  typography: {
    'B-1': {
      fontFamily: 'Inter',
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'B-2': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 600,
      letterSpacing: '-0.6px',
      textAlign: 'center'
    },
    'B-3': {
      fontFamily: 'Inter',
      fontSize: '16px',
      fontWeight: 600,
      letterSpacing: '-0.6px',
      textAlign: 'center'
    },
    'B-4': {
      fontFamily: 'Inter',
      fontSize: '12px',
      fontWeight: 500,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'B-5': {
      fontFamily: 'Inter',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'B-6': {
      fontFamily: 'Inter',
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '-0.6px',
      textAlign: 'center'
    },
    'H-1': {
      fontFamily: 'OdibeeSans',
      fontSize: '40px',
      fontWeight: 400,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'H-2': {
      fontFamily: 'OdibeeSans',
      fontSize: '29px',
      fontWeight: 400,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'H-3': {
      fontFamily: 'OdibeeSans',
      fontSize: '24px',
      fontWeight: 400,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'H-4': {
      fontFamily: 'OdibeeSans',
      fontSize: '18px',
      fontWeight: 400,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'H-5': {
      fontFamily: 'OdibeeSans',
      fontSize: '16px',
      fontWeight: 400,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'S-1': {
      fontFamily: 'Inter',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    },
    'S-2': {
      fontFamily: 'Inter',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '-0.19px',
      textAlign: 'center'
    }
  }
};
