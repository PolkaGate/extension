// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

export default function useIsTestnetEnabled (): boolean | undefined {
  return useMemo(() => window.localStorage.getItem('testnet_enabled') === 'true', []);
}
