// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { APIContext } from '../components';
import { useChain, useEndpoint2 } from '.';

export default function useApi(address: AccountId | string | undefined, stateApi?: ApiPromise): ApiPromise | undefined {
  const endpoint = useEndpoint2(address);
  const apisContext = useContext(APIContext);
  const chain = useChain(address);

  const [api, setApi] = useState<ApiPromise | undefined>(stateApi);

  useEffect(() => {
    if (api?.isConnected && api._options?.provider?.endpoint === endpoint) {
      return;
    }

    if (chain?.genesisHash && apisContext?.apis[chain.genesisHash]) {
      const savedApis = apisContext.apis[chain.genesisHash];

      const savedApi = savedApis.find((SApi) => SApi.endpoint === endpoint)?.api;

      if (savedApi?.isConnected) {
        console.log(`♻ using the saved api for ${chain.name}`);

        return setApi(savedApi);
      }
    }

    if (!endpoint) {
      return;
    }

    const wsProvider = new WsProvider(endpoint);

    ApiPromise.create({ provider: wsProvider }).then((api) => {
      setApi(api);

      const prevApis = apisContext.apis[String(api.genesisHash.toHex())];

      if (prevApis && prevApis.length > 0) {
        apisContext.apis[String(api.genesisHash.toHex())] = [{ api, endpoint }, ...prevApis];
      } else {
        apisContext.apis[String(api.genesisHash.toHex())] = [{ api, endpoint }];
      }

      apisContext.setIt(apisContext.apis);
    }).catch(console.error);
  }, [apisContext, endpoint, stateApi, chain, api]);

  return api;
}
