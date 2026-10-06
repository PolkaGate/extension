// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useContext, useEffect, useRef, useState } from 'react';

import { APIContext } from '../components';
import { useEndpoint, useEndpoints } from '.';

export default function useApi(genesisHash: string | null | undefined): ApiPromise | undefined | null {
  const { getApi } = useContext(APIContext);
  const endpoints = useEndpoints(genesisHash);
  const { endpoint } = useEndpoint(genesisHash);

  const connectionKey = `${genesisHash ?? ''}:${endpoint ?? ''}`;
  const requestId = useRef(0);
  const [apiState, setApiState] = useState<{ api: ApiPromise | undefined; connectionKey: string }>({
    api: undefined,
    connectionKey: ''
  });

  useEffect(() => {
    const currentRequest = ++requestId.current;

    setApiState({ api: undefined, connectionKey });

    if (!genesisHash || !endpoints) {
      return () => { requestId.current += 1; };
    }

    getApi(genesisHash, endpoints)?.then((nextApi) => {
      if (currentRequest === requestId.current) {
        setApiState({ api: nextApi, connectionKey });
      }
    }).catch(console.error);

    return () => { requestId.current += 1; };
  }, [connectionKey, endpoints, genesisHash, getApi]);

  const api = apiState.connectionKey === connectionKey ? apiState.api : undefined;

  return endpoints.length === 0
    ? null
    : api;
}
