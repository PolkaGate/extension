// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useEffect, useState } from 'react';

import { AUTO_MODE } from '../util/constants';
import useEndpoint from './useEndpoint';

const SLOW_ENDPOINT_TIMEOUT_MS = 10_000;

/**
 * Returns true when:
 * - The API has been loading (undefined) for > SLOW_ENDPOINT_TIMEOUT_MS, OR
 * - The API is connected but an RPC operation (e.g. fee estimation) has been
 *   pending for > SLOW_ENDPOINT_TIMEOUT_MS (pass isFetching=true while it loads)
 * AND the user has a non-auto (manually pinned) endpoint selected.
 * Resets immediately when the API resolves or isFetching becomes false.
 */
export default function useSlowEndpoint(
  genesisHash: string | null | undefined,
  api: ApiPromise | null | undefined,
  isFetching?: boolean
): boolean {
  const { endpoint } = useEndpoint(genesisHash);
  const isManualEndpoint = !!endpoint && endpoint !== AUTO_MODE.value;

  const [isSuspect, setIsSuspect] = useState(false);

  // Reset immediately whenever the endpoint itself changes — the user switched nodes.
  useEffect(() => {
    setIsSuspect(false);
  }, [endpoint]);

  useEffect(() => {
    // Case 1: API not connected yet
    // Case 2: API connected but an RPC call is hanging (isFetching=true)
    const isWaiting = !api || isFetching === true;

    if (!isWaiting || !isManualEndpoint || !genesisHash) {
      setIsSuspect(false);

      return;
    }

    const timer = setTimeout(() => setIsSuspect(true), SLOW_ENDPOINT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [api, genesisHash, isFetching, isManualEndpoint]);

  return isSuspect;
}
