// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetsWithUiAndPrice } from './types';

import { type Theme } from '@mui/material';

import { DEFAULT_COLOR, TOKENS_WITH_BLACK_LOGO } from '@polkadot/extension-polkagate/src/util/constants';

export function adjustColor (token: string, color: string | undefined, theme: Theme): string {
  if (color && (TOKENS_WITH_BLACK_LOGO.find((t) => t === token) && theme.palette.mode === 'dark')) {
    const cleanedColor = color.replace(/^#/, '');

    // Convert hexadecimal to RGB
    const r = parseInt(cleanedColor.substring(0, 2), 16);
    const g = parseInt(cleanedColor.substring(2, 4), 16);
    const b = parseInt(cleanedColor.substring(4, 6), 16);

    // Calculate inverted RGB values
    const invertedR = 255 - r;
    const invertedG = 255 - g;
    const invertedB = 255 - b;

    // Convert back to hexadecimal format
    const invertedHex = `#${(1 << 24 | invertedR << 16 | invertedG << 8 | invertedB).toString(16).slice(1)}`;

    return invertedHex;
  }

  return color || DEFAULT_COLOR;
}

export function truncateToMaxYDecimals (num: number, y: number): string {
  const [intPart, decPart] = num.toString().split('.');

  if (!decPart) {
    return intPart;
  }

  return `${intPart}.${decPart.slice(0, y)}`;
}

export function getMaxBalanceAsset (assets: AssetsWithUiAndPrice[]) {
  return assets.reduce((max, asset) =>
    asset.totalBalance > max.totalBalance ? asset : max
  );
}

export const normalizePercent = (p: number) => (p > 5 ? p : p > 0 ? 5 : 0);
