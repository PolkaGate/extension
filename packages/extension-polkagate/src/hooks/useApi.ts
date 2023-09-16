// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { APIContext } from '../components';
import LCConnector from '../util/api/lightClient-connect';
import { useChain, useEndpoint } from '.';

export default function useApi(address: AccountId | string | undefined, stateApi?: ApiPromise): ApiPromise | undefined {
  const endpoint = useEndpoint(address);
  const apisContext = useContext(APIContext);
  const chain = useChain(address);

  const [api, setApi] = useState<ApiPromise | undefined>(stateApi);

  useEffect(() => {
    if (!chain?.genesisHash || (api && api.isConnected && api._options.provider.endpoint === endpoint)) {
      return;
    }

    const savedApi = apisContext?.apis[chain.genesisHash]?.find((sApi) => sApi.endpoint === endpoint);

    if (savedApi && savedApi.api && savedApi.api.isConnected) {
      // console.log(`♻ Using the saved API for ${chain.name} through this endpoint ${savedApi.api._options.provider.endpoint as string ?? ''}`);
      setApi(savedApi.api);

      return;
    }

    if (!endpoint || savedApi?.isRequested === true) {
      // console.log('API is already requested, waiting...');

      return;
    }

    // console.log('Initializing API connection...');

    if (endpoint?.startsWith('wss')) {
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
            isRequested: false
          });

          apisContext.apis[String(newApi.genesisHash.toHex())] = toSaveApi;
          apisContext.setIt(apisContext.apis);
        })
        .catch((error) => {
          console.error('API connection failed:', error);
        });

      const toSaveApi = apisContext.apis[chain.genesisHash] ?? [];

      toSaveApi.push({ endpoint, isRequested: true });

      apisContext.apis[chain.genesisHash] = toSaveApi;
      apisContext.setIt(apisContext.apis);

      return;
    }

    if (endpoint?.startsWith('light')) {
      LCConnector(endpoint).then((LCapi) => {
        setApi(LCapi);
        console.log('🖌️ light client connected', String(LCapi.genesisHash.toHex()));

        const toSaveApi = apisContext.apis[String(LCapi.genesisHash.toHex())] ?? [];

        const indexToDelete = toSaveApi.findIndex((sApi) => sApi.endpoint === endpoint);

        if (indexToDelete !== -1) {
          toSaveApi.splice(indexToDelete, 1);
        }

        toSaveApi.push({
          api: LCapi,
          endpoint,
          isRequested: false
        });

        apisContext.apis[String(LCapi.genesisHash.toHex())] = toSaveApi;
        apisContext.setIt(apisContext.apis);
      }).catch((err) => {
        console.error(err);
        console.log('📌 light client failed.');
      });

      const toSaveApi = apisContext.apis[chain.genesisHash] ?? [];

      toSaveApi.push({ endpoint, isRequested: true });

      apisContext.apis[chain.genesisHash] = toSaveApi;
      apisContext.setIt(apisContext.apis);

      return;
    }

    console.log('📌 📌  Unsupported endpoint detected 📌 📌 ', endpoint);
  }, [apisContext, endpoint, stateApi, chain, api?.isConnected, api]);

  useEffect(() => {
    const pollingInterval = setInterval(() => {
      const savedApi = apisContext?.apis[chain?.genesisHash ?? '']?.find((sApi) => sApi.endpoint === endpoint);

      if (savedApi?.api?.isConnected) {
        // console.log('API connection is ready, updating state.');

        setApi(savedApi.api);
        clearInterval(pollingInterval);
      }
    }, 1000);

    return () => clearInterval(pollingInterval);
  }, [apisContext, chain, endpoint]);

  return api;
}
