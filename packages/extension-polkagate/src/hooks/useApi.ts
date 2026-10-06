// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useContext, useEffect, useState } from 'react';

import { APIContext } from '../components';
import { useEndpoint, useEndpoints } from '.';

export default function useApi(genesisHash: string | null | undefined): ApiPromise | undefined | null {
  const { getApi } = useContext(APIContext);
  const endpoints = useEndpoints(genesisHash);
  const { endpoint } = useEndpoint(genesisHash);

  const [api, setApi] = useState<ApiPromise | undefined | null>(undefined);

  // Reset local api state whenever the active endpoint changes so stale api
  // from a previous (failed) connection doesn't persist.
  useEffect(() => {
    setApi(undefined);
  }, [endpoint]);

  useEffect(() => {
    if (!genesisHash || !endpoints) {
      return;
    }

    getApi(genesisHash, endpoints)?.then(setApi).catch(console.error);
  }, [endpoint, endpoints, genesisHash, getApi]);

  return endpoints.length === 0
    ? null
    : api;
}
