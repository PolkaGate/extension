// Copyright 2017-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RefreshState {
  refreshTime?: number;
}

const OFFSET = 2000; // 2 seconds in mili

/**
 * Hook to programmatically refresh the current route by updating its state.
 *
 * 🚨 IMPORTANT:
 * - This hook must be called in BOTH:
 *    1. The page you want to re-render (e.g., `index.tsx`)
 *    2. Any child/modal component that triggers the refresh
 *
 * @param onRefresh Optional callback to run when the route is "refreshed"
 * @returns A function you can call to trigger a refresh
 */
export default function useRouteRefresh (onRefresh?: () => void): () => void {
  const navigate = useNavigate();
  const location = useLocation();

  // Type assertion for state
  const state = location.state as RefreshState | null;

  useEffect(() => {
    const timestamp = state?.refreshTime;

    if (timestamp && Date.now() <= (timestamp + OFFSET)) {
      onRefresh?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.refreshTime]);

  const refresh = useCallback(() => {
    navigate(location.pathname, {
      replace: true,
      state: {
        ...state,
        refreshTime: Date.now()
      }
    }) as void;
  }, [location.pathname, navigate, state]);

  return refresh;
}
