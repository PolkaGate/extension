// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useLocation } from 'react-router-dom';

export default function useIsBlueish (): boolean {
  const { pathname } = useLocation();
  const isBlueish = pathname.includes('/solo/');

  return isBlueish;
}
