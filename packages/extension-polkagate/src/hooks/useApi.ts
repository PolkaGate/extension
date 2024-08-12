// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { ChromeStorageGetResponse } from '../util/types';

import { useCallback, useContext, useEffect, useReducer } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { APIContext } from '../components';
import LCConnector from '../util/api/lightClient-connect';
import { AUTO_MODE, NO_PASS_PERIOD as ENDPOINT_TIMEOUT } from '../util/constants';
import { fastestConnection } from '../util/utils';
import { useChainName, useEndpoint, useEndpoints, useGenesisHash } from '.';

interface ApiState {
  api: ApiPromise | undefined;
  isLoading: boolean;
  error: Error | null;
}

type ApiAction =
  | { type: 'SET_API'; payload: ApiPromise }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error };

const apiReducer = (state: ApiState, action: ApiAction): ApiState => {
  switch (action.type) {
    case 'SET_API':
      return { ...state, api: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export default function useApi (address: AccountId | string | undefined, stateApi?: ApiPromise, _endpoint?: string, _genesisHash?: string): ApiPromise | undefined {
  const { endpoint, timestamp } = useEndpoint(address, _endpoint);
  const apisContext = useContext(APIContext);
  const chainGenesisHash = useGenesisHash(address, _genesisHash);
  const chainName = useChainName(address);
  const endpoints = useEndpoints(chainGenesisHash);

  const [state, dispatch] = useReducer(apiReducer, {
    api: stateApi,
    error: null,
    isLoading: false
  });

  const handleNewApi = useCallback((api: ApiPromise, endpoint: string, onAutoMode?: boolean) => {
    dispatch({ payload: api, type: 'SET_API' });

    const genesisHash = String(api.genesisHash.toHex());
    const toSaveApi = apisContext.apis[genesisHash] ?? [];

    const indexToDelete = toSaveApi.findIndex((sApi) => sApi.endpoint === endpoint);

    if (indexToDelete !== -1) {
      toSaveApi.splice(indexToDelete, 1);
    }

    if (onAutoMode) {
      const indexToDelete = toSaveApi.findIndex((sApi) => sApi.endpoint === AUTO_MODE.value);

      indexToDelete !== -1 && toSaveApi.splice(indexToDelete, 1);
    }

    toSaveApi.push({
      api,
      endpoint,
      isRequested: false
    });

    apisContext.apis[genesisHash] = toSaveApi;
    apisContext.setIt(apisContext.apis);
  }, [apisContext]);

  const connectToEndpoint = useCallback((endpointToConnect: string) => {
    dispatch({ payload: true, type: 'SET_LOADING' });
    const wsProvider = new WsProvider(endpointToConnect);

    ApiPromise.create({ provider: wsProvider })
      .then((newApi) => handleNewApi(newApi, endpointToConnect))
      .catch((error) => dispatch({ payload: error as Error, type: 'SET_ERROR' }));
  }, [handleNewApi]);

  const handleAutoMode = useCallback((address: string, chainName: string, endpointToCheck: string, timeStampToCheck: number | undefined) => {
    if (timeStampToCheck === undefined || (Date.now() - timeStampToCheck) > 10000 || endpointToCheck === AUTO_MODE.value) {
      const withoutLC = endpoints.filter(({ value }) => String(value).startsWith('wss'));

      fastestConnection(withoutLC)
        .then(({ api, selectedEndpoint }) => {
          chainName && address && chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
            const i = `${address}`;
            const j = `${chainName}`;
            const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

            savedEndpoints[i] = savedEndpoints[i] || {};

            savedEndpoints[i][j] = {
              endpoint: selectedEndpoint,
              timestamp: Date.now()
            };

            chrome.storage.local.set({ endpoints: savedEndpoints })
              .finally(() => handleNewApi(api, selectedEndpoint, true))
              .catch(console.error);
          });
        })
        .catch(console.error);
    } else {
      chainName && address && chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
        const i = `${address}`;
        const j = `${chainName}`;
        const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

        savedEndpoints[i] = savedEndpoints[i] || {};

        savedEndpoints[i][j] = {
          endpoint: endpointToCheck,
          timestamp: Date.now()
        };

        chrome.storage.local.set({ endpoints: savedEndpoints })
          .then(() => connectToEndpoint(endpointToCheck))
          .catch(console.error);
      });
    }
  }, [connectToEndpoint, endpoints, handleNewApi]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!address || !chainGenesisHash || !chainName || (state.api && state.api._options.provider?.endpoint === endpoint)) {
      return;
    }

    const savedApi = apisContext?.apis[chainGenesisHash]?.find((sApi) => sApi.endpoint === endpoint);

    if (savedApi?.api && savedApi.api.isConnected) {
      // console.log(`♻ Using the saved API for ${chainGenesisHash} through this endpoint ${savedApi.api._options.provider.endpoint as string ?? ''}`);
      dispatch({ payload: savedApi.api, type: 'SET_API' });

      return;
    }

    if (savedApi?.isRequested === true) {
      // console.log('API is already requested, waiting...');

      return;
    }

    if (!endpoint?.startsWith('wss') && !endpoint?.startsWith('light') && endpoint !== AUTO_MODE.value) {
      console.log('📌 📌  Unsupported endpoint detected 📌 📌 ', endpoint);

      return;
    }

    if (endpoint?.startsWith('wss') || endpoint === AUTO_MODE.value || !timestamp) {
      handleAutoMode(String(address), chainName, endpoint, timestamp);
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
    const isOutDatedEndpoint = Date.now() - (timestamp ?? 0) > ENDPOINT_TIMEOUT;

    toSaveApi.push({ endpoint: isOutDatedEndpoint ? AUTO_MODE.value : endpoint, isRequested: true });

    apisContext.apis[chainGenesisHash] = toSaveApi;
    apisContext.setIt(apisContext.apis);
  }, [address, state.api, apisContext, chainGenesisHash, chainName, endpoint, handleAutoMode, handleNewApi, timestamp]);

  useEffect(() => {
    const pollingInterval = setInterval(() => {
      const savedApi = apisContext?.apis[chainGenesisHash ?? '']?.find((sApi) => sApi.endpoint === endpoint);

      if (savedApi?.api?.isConnected) {
        dispatch({ payload: savedApi.api, type: 'SET_API' });
        clearInterval(pollingInterval);
      }
    }, 1000);

    return () => clearInterval(pollingInterval);
  }, [apisContext, chainGenesisHash, endpoint]);

  return state.api;
}
