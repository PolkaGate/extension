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
    if (!chain?.genesisHash || (api && api.isConnected && api._options.provider.endpoint === endpoint)) {
      return;
    } else if (api && api._options.provider.endpoint !== endpoint) {
      const toSaveApi = apisContext.apis[String(api.genesisHash.toHex())] ?? [];

      const index = toSaveApi.findIndex((sApi) => sApi.endpoint === api._options.provider.endpoint);

      if (index !== -1) {
        toSaveApi[index].inUse = false;

        apisContext.apis[String(api.genesisHash.toHex())] = toSaveApi;
        apisContext.setIt(apisContext.apis);
      }
    }

    const savedApi = apisContext?.apis[chain.genesisHash]?.find((sApi) => sApi.endpoint === endpoint);

    if (savedApi && savedApi.api && savedApi.api.isConnected) {
      console.log(`♻ Using the saved API for ${chain.name} through this endpoint ${savedApi.api._options.provider.endpoint as string ?? ''}`);
      setApi(savedApi.api);

      return;
    }

    if (!endpoint || (savedApi && !savedApi.api)) {
      console.log('API is already requested, waiting...');

      return;
    }

    console.log('Initializing API connection...');

    const wsProvider = new WsProvider(endpoint);

    ApiPromise.create({ provider: wsProvider })
      .then((newApi) => {
        console.log('API connection established successfully.');
        setApi(newApi);

        const toSaveApi = apisContext.apis[String(newApi.genesisHash.toHex())] ?? [];

        const indexToDelete = toSaveApi.findIndex((sApi) => sApi.endpoint === endpoint);

        if (indexToDelete !== -1) {
          toSaveApi.splice(indexToDelete, 1);
        }

        toSaveApi.push({
          api: newApi,
          endpoint,
          inUse: true
        });

        apisContext.apis[String(newApi.genesisHash.toHex())] = toSaveApi;
        apisContext.setIt(apisContext.apis);
      })
      .catch((error) => {
        console.error('API connection failed:', error);
      });

    const toSaveApi = apisContext.apis[chain.genesisHash] ?? [];

    toSaveApi.push({ endpoint });

    apisContext.apis[chain.genesisHash] = toSaveApi;
    apisContext.setIt(apisContext.apis);
  }, [apisContext, endpoint, stateApi, chain, api?.isConnected, api]);

  useEffect(() => {
    const pollingInterval = setInterval(() => {
      const savedApi = apisContext?.apis[chain?.genesisHash ?? '']?.find((sApi) => sApi.endpoint === endpoint);

      if (savedApi?.api?.isConnected) {
        console.log('API connection is ready, updating state.');

        setApi(savedApi.api);
        clearInterval(pollingInterval);
      }
    }, 1000);

    return () => clearInterval(pollingInterval);
  }, [apisContext, chain, endpoint]);

  return api;
}
