// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { STORAGE_KEY } from '../util/constants';

export function chooseTheme(): 'dark' | 'light' {
  const preferredTheme = localStorage.getItem(STORAGE_KEY.THEME);

  if (preferredTheme === 'dark' || preferredTheme === 'light') {
    return preferredTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}
