// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { useContext, useEffect, useState } from 'react';

import { APIContext } from '../components';
import { useEndpoints } from '.';

export default function useApi (genesisHash: string | null | undefined): ApiPromise | undefined {
  const { getApi } = useContext(APIContext);
  const endpoints = useEndpoints(genesisHash);

  const [api, setApi] = useState<ApiPromise | undefined>(undefined);

  useEffect(() => {
    if (!genesisHash || !endpoints) {
      return;
    }

    getApi(genesisHash, endpoints)?.then(setApi).catch(console.error);
  }, [endpoints, genesisHash, getApi]);

  return api;
}
