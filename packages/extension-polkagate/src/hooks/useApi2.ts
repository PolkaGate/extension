// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { useEndpoint2 } from '.';

export default function useApi2(address: string | undefined): ApiPromise | undefined {
  const endpoint = useEndpoint2(address);

  const [api, setApi] = useState<ApiPromise | undefined>();

  useEffect(() => {
    if (!endpoint) { return; }

    const wsProvider = new WsProvider(endpoint);

    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api)).catch(console.error);
  }, [endpoint]);

  return api;
}
