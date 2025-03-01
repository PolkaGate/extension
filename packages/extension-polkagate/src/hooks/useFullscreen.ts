// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useLayoutEffect } from 'react';

export default function useFullscreen(): void {
  useLayoutEffect(() => {
    /** to change app width to full screen */
    const root = document.getElementById('root');

    if (root) {
      root.style.width = '100%';
    }

    return () => {
      if (root) {
        root.style.width = '';
      }
    };
  }, []);
}
