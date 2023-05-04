// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { createWsEndpoints } from '@polkadot/apps-config';
import { Chain } from '@polkadot/extension-chains/types';

import { APIContext } from '../components';
import { sanitizeChainName } from '../util/utils';

export default function useApiWithChain(chain: Chain | undefined): ApiPromise | undefined {
  const apisContext = useContext(APIContext);
  const [api, setApi] = useState<ApiPromise | undefined>();

  const endpoint = useMemo(() => {
    const chainName = sanitizeChainName(chain?.name);
    const allEndpoints = createWsEndpoints((key: string, value: string | undefined) => value || key);

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.length ? endpoints[endpoints.length > 2 ? 1 : 0].value : undefined;
  }, [chain?.name]);

  useEffect(() => {
    if (chain?.genesisHash && apisContext?.apis[chain.genesisHash]) {
      const api = apisContext?.apis[chain.genesisHash].api;

      if (api?.isConnected) {
        console.log(`♻ using the saved api for ${chain.name} in useApiWithChain`);

        return setApi(api);
      }
    }

    if (!endpoint) {
      return;
    }

    const wsProvider = new WsProvider(endpoint);

    ApiPromise.create({ provider: wsProvider }).then((api) => setApi(api)).catch(console.error);
  }, [apisContext, chain, endpoint]);

  return api;
}
