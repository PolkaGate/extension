// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { APIContext } from '../components';
import { sanitizeChainName } from '../util/utils';

const allEndpoints = createWsEndpoints();

export default function useApiWithChain (chain: Chain | null | undefined, api?: ApiPromise): ApiPromise | undefined {
  const apisContext = useContext(APIContext);
  const [_api, setApi] = useState<ApiPromise | undefined>();

  const maybeEndpoint = useMemo(() => {
    const chainName = sanitizeChainName(chain?.name);
    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.length ? endpoints[0].value : undefined;
  }, [chain?.name]);

  useEffect(() => {
    if (api) {
      return setApi(api);
    }

    const _genesisHash = chain?.genesisHash;

    if (_genesisHash && apisContext?.apis[_genesisHash]) {
      const maybeApi = apisContext.apis[_genesisHash].find(({ api }) => api?.isConnected)?.api;

      if (maybeApi) {
        console.log(`♻ using the saved api for ${chain.name} in useApiWithChain`);

        return setApi(maybeApi);
      }
    }

    if (!maybeEndpoint) {
      return;
    }

    const wsProvider = new WsProvider(maybeEndpoint);

    ApiPromise.create({ provider: wsProvider }).then((a) => setApi(a)).catch(console.error);
  }, [api, apisContext, chain, maybeEndpoint]);

  return _api;
}
