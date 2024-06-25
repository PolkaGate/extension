// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useMemo } from 'react';

export default function useIsPopup(): boolean {
  return useMemo(() => {
    return window.innerWidth <= 357;
  }, []);
}
