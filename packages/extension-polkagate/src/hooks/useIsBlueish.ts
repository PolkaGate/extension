// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export default function useIsBlueish(): boolean {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname.includes('fullscreen')) {
      return false;
    }

    return pathname.includes('/solo/') || pathname.includes('/pool/') || pathname.includes('stakingReward') || pathname.includes('pendingReward') || pathname.includes('easyStake');
  }, [pathname]);
}
