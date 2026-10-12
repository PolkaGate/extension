// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useEffect, useState } from 'react';

import { AUTO_MODE } from '../util/constants';
import useEndpoint from './useEndpoint';

const SLOW_ENDPOINT_TIMEOUT_MS = 10_000;

export type SlowEndpointKind = 'manual' | 'auto' | false;

/**
 * Returns the kind of slow/unreachable endpoint situation:
 * - 'manual' : user has a manually-pinned endpoint that is unreachable or hanging
 * - 'auto'   : user is on auto mode but no endpoint could be reached
 * - false    : no problem (or not yet timed out)
 *
 * Triggers after SLOW_ENDPOINT_TIMEOUT_MS of:
 * - API still loading (undefined), OR
 * - API connected but an RPC call is hanging (isFetching=true)
 * Resets immediately when the API resolves or isFetching becomes false.
 */
export default function useSlowEndpoint(
  genesisHash: string | null | undefined,
  api: ApiPromise | null | undefined,
  isFetching?: boolean
): SlowEndpointKind {
  const endpointInfo = useEndpoint(genesisHash);
  const { endpoint } = endpointInfo;

  // An endpoint is "auto" while the stored value is the sentinel OR after
  // auto-mode resolved and wrote back a real wss:// URL (isAuto flag stays true).
  const isAutoEndpoint = endpointInfo.isAuto === true || endpoint === AUTO_MODE.value;
  const isManualEndpoint = !!endpoint && !isAutoEndpoint;

  const [isSuspect, setIsSuspect] = useState(false);

  // Reset immediately whenever the endpoint itself changes — the user switched nodes.
  useEffect(() => {
    setIsSuspect(false);
  }, [endpoint]);

  useEffect(() => {
    // Case 1: API not connected yet
    // Case 2: API connected but an RPC call is hanging (isFetching=true)
    const isWaiting = !api || isFetching === true;

    if (!isWaiting || (!isManualEndpoint && !isAutoEndpoint) || !genesisHash) {
      setIsSuspect(false);

      return;
    }

    const timer = setTimeout(() => setIsSuspect(true), SLOW_ENDPOINT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [api, genesisHash, isFetching, isAutoEndpoint, isManualEndpoint]);

  if (!isSuspect) {
    return false;
  }

  return isManualEndpoint ? 'manual' : 'auto';
}
