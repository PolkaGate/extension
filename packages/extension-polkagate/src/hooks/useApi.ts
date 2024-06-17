// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { APIContext } from '../components';
import LCConnector from '../util/api/lightClient-connect';
import { useEndpoint, useGenesisHash } from '.';

export default function useApi(address: AccountId | string | undefined, stateApi?: ApiPromise, _endpoint?: string, _genesisHash?: string): ApiPromise | undefined {
  const endpoint = useEndpoint(address, _endpoint);
  const apisContext = useContext(APIContext);
  const chainGenesisHash = useGenesisHash(address, _genesisHash);

  const [api, setApi] = useState<ApiPromise | undefined>(stateApi);

  const handleNewApi = useCallback((api: ApiPromise, endpoint: string) => {
    setApi(api);
    const genesisHash = String(api.genesisHash.toHex());
    const toSaveApi = apisContext.apis[genesisHash] ?? [];

    const indexToDelete = toSaveApi.findIndex((sApi) => sApi.endpoint === endpoint);

    if (indexToDelete !== -1) {
      toSaveApi.splice(indexToDelete, 1);
    }

    toSaveApi.push({
      api,
      endpoint,
      isRequested: false
    });

    apisContext.apis[genesisHash] = toSaveApi;
    apisContext.setIt(apisContext.apis);
  }, [apisContext]);

  useEffect(() => {
    if (!chainGenesisHash || (api && api.isConnected && api._options.provider?.endpoint === endpoint)) {
      return;
    }

    const savedApi = apisContext?.apis[chainGenesisHash]?.find((sApi) => sApi.endpoint === endpoint);

    if (savedApi && savedApi.api && savedApi.api.isConnected) {
      // console.log(`♻ Using the saved API for ${chainGenesisHash} through this endpoint ${savedApi.api._options.provider.endpoint as string ?? ''}`);
      setApi(savedApi.api);

      return;
    }

    if (!endpoint || savedApi?.isRequested === true) {
      // console.log('API is already requested, waiting...');

      return;
    }

    if (!endpoint?.startsWith('wss') && !endpoint?.startsWith('light')) {
      console.log('📌 📌  Unsupported endpoint detected 📌 📌 ', endpoint);

      return;
    }

    if (endpoint?.startsWith('wss')) {
      const wsProvider = new WsProvider(endpoint);

      ApiPromise.create({ provider: wsProvider })
        .then((newApi) => {
          handleNewApi(newApi, endpoint);
        })
        .catch((error) => {
          console.error('API connection failed:', error);
        });
    }

    if (endpoint?.startsWith('light')) {
      LCConnector(endpoint).then((LCapi) => {
        handleNewApi(LCapi, endpoint);
        console.log('🖌️ light client connected', String(LCapi.genesisHash.toHex()));
      }).catch((err) => {
        console.error('📌 light client failed:', err);
      });
    }

    const toSaveApi = apisContext.apis[chainGenesisHash] ?? [];

    toSaveApi.push({ endpoint, isRequested: true });

    apisContext.apis[chainGenesisHash] = toSaveApi;
    apisContext.setIt(apisContext.apis);
  }, [apisContext, endpoint, stateApi, chainGenesisHash, api?.isConnected, api, handleNewApi]);

  useEffect(() => {
    const pollingInterval = setInterval(() => {
      const savedApi = apisContext?.apis[chainGenesisHash ?? '']?.find((sApi) => sApi.endpoint === endpoint);

      if (savedApi?.api?.isConnected) {
        // console.log('API connection is ready, updating state.');

        setApi(savedApi.api);
        clearInterval(pollingInterval);
      }
    }, 1000);

    return () => clearInterval(pollingInterval);
  }, [apisContext, chainGenesisHash, endpoint]);

  return api;
}
