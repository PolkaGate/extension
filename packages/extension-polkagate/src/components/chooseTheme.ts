// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function chooseTheme(): 'dark' | 'light' {
  // TODO: will release Dark first then work on light mode
  return 'dark';

  // const preferredTheme = localStorage.getItem('theme');

  // if (preferredTheme) {
  //   return preferredTheme === 'dark'
  //     ? 'dark'
  //     : 'light';
  // }

  // return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
  //   ? 'light'
  //   : 'dark';
}
