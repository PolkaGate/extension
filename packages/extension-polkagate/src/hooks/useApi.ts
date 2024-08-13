// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { ChromeStorageGetResponse } from '../util/types';

import { useCallback, useContext, useEffect, useReducer } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { APIContext } from '../components';
import LCConnector from '../util/api/lightClient-connect';
import { AUTO_MODE } from '../util/constants';
import { fastestConnection } from '../util/utils';
import { useChainName, useEndpoint, useEndpoints, useGenesisHash } from '.';

// Define types for API state and actions
interface ApiState {
  api: ApiPromise | undefined; // The API object, initially undefined
  isLoading: boolean; // Whether the API connection is in the loading state
  error: Error | null; // Any error that occurs during the API connection process
}

// Reducer function to manage API state
type ApiAction =
  | { type: 'SET_API'; payload: ApiPromise }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error };

const apiReducer = (state: ApiState, action: ApiAction): ApiState => {
  switch (action.type) {
    case 'SET_API':
      return { ...state, api: action.payload, error: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export default function useApi (address: AccountId | string | undefined, stateApi?: ApiPromise, _endpoint?: string, _genesisHash?: string): ApiPromise | undefined {
  const { endpoint } = useEndpoint(address, _endpoint);
  const apisContext = useContext(APIContext);
  const chainGenesisHash = useGenesisHash(address, _genesisHash);
  const chainName = useChainName(address);
  const endpoints = useEndpoints(chainGenesisHash);

  const [state, dispatch] = useReducer(apiReducer, {
    api: stateApi,
    error: null,
    isLoading: false
  });

  const updateEndpoint = useCallback((address: string, chainName: string, selectedEndpoint: string, cbFunction?: () => void) => {
    chrome.storage.local.get('endpoints', (res: { endpoints?: ChromeStorageGetResponse }) => {
      const i = `${address}`;
      const j = `${chainName}`;
      const savedEndpoints: ChromeStorageGetResponse = res?.endpoints || {};

      savedEndpoints[i] = savedEndpoints[i] || {};

      savedEndpoints[i][j] = {
        endpoint: selectedEndpoint,
        timestamp: Date.now()
      };

      chrome.storage.local.set({ endpoints: savedEndpoints })
        .finally(() => cbFunction && cbFunction())
        .catch(console.error);
    });
  }, []);

  // Checks if there is an available API connection, then will change the address endpoint to the available API's endpoint
  // Returns false if it was not successful to find an available API and true vice versa
  const connectToExisted = useCallback((address: string, chainName: string, genesisHash: string): boolean => {
    for (const apiItem in apisContext.apis) {
      if (apiItem === genesisHash) {
        const availableApi = apisContext.apis[genesisHash].find(({ api }) => api?.isConnected);

        if (!availableApi?.api) {
          return false;
        }

        dispatch({ payload: availableApi.api, type: 'SET_API' });
        updateEndpoint(address, chainName, availableApi.endpoint);

        return true;
      }
    }

    return false;
  }, [apisContext.apis, updateEndpoint]);

  // Handles a new API connection and updates the context with the new API
  const handleNewApi = useCallback((api: ApiPromise, endpoint: string, onAutoMode?: boolean) => {
    dispatch({ payload: api, type: 'SET_API' });

    const genesisHash = String(api.genesisHash.toHex());
    const toSaveApi = apisContext.apis[genesisHash] ?? [];

    // Remove any existing API with the same endpoint
    // it happens when the API is requested and not connected yet
    const indexToDelete = toSaveApi.findIndex((sApi) => sApi.endpoint === endpoint);

    if (indexToDelete !== -1) {
      toSaveApi.splice(indexToDelete, 1);
    }

    // If in auto mode, remove any auto mode endpoint
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

  // Connects to a specific WebSocket endpoint and creates a new API instance
  // when it is not on Auto Mode
  const connectToEndpoint = useCallback((endpointToConnect: string) => {
    dispatch({ payload: true, type: 'SET_LOADING' });
    const wsProvider = new WsProvider(endpointToConnect);

    ApiPromise.create({ provider: wsProvider })
      .then((newApi) => handleNewApi(newApi, endpointToConnect))
      .catch((error) => dispatch({ payload: error as Error, type: 'SET_ERROR' }));
  }, [handleNewApi]);

  // Handles auto mode by finding the fastest endpoint and connecting to it
  const handleAutoMode = useCallback((address: string, chainName: string) => {
    const withoutLC = endpoints.filter(({ value }) => String(value).startsWith('wss'));

    // Finds the fastest available endpoint and connects to it
    fastestConnection(withoutLC)
      .then(({ api, selectedEndpoint }) => {
        updateEndpoint(address, chainName, selectedEndpoint, () => handleNewApi(api, selectedEndpoint, true));
      })
      .catch(console.error);
  }, [endpoints, handleNewApi, updateEndpoint]);

  // Manages the API connection when the address, endpoint, or genesis hash changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!address || !chainGenesisHash || !chainName || !endpoint || (state.api && state.api._options.provider?.endpoint === endpoint)) {
      return;
    }

    // Check if there is a saved API that is already connected
    const savedApi = apisContext?.apis[chainGenesisHash]?.find((sApi) => sApi.endpoint === endpoint);

    if (savedApi?.api && savedApi.api.isConnected) {
      // console.log(`♻ Using the saved API for ${chainGenesisHash} through this endpoint ${savedApi.api._options.provider.endpoint as string ?? ''}`);
      dispatch({ payload: savedApi.api, type: 'SET_API' });

      return;
    }

    // If the API is already being requested, skip the connection process
    // It can be either Auto Mode or a specific endpoint
    if (savedApi?.isRequested === true) {
      // console.log('API is already requested, waiting...');

      return;
    }

    // Validate the endpoint format (it should start with 'wss', 'light', or be in auto mode)
    if (!endpoint?.startsWith('wss') && !endpoint?.startsWith('light') && endpoint !== AUTO_MODE.value) {
      console.log('📌 📌  Unsupported endpoint detected 📌 📌 ', endpoint);

      return;
    }

    // If in auto mode, check existing connections or find a new one
    if (endpoint === AUTO_MODE.value) {
      const result = connectToExisted(String(address), chainName, chainGenesisHash);

      if (result) {
        return;
      }

      handleAutoMode(String(address), chainName);
    }

    // Connect to a WebSocket endpoint if provided
    if (endpoint?.startsWith('wss')) {
      connectToEndpoint(endpoint);
    }

    // Connect to a light client endpoint if provided
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
  }, [address, apisContext, chainGenesisHash, chainName, connectToEndpoint, connectToExisted, endpoint, handleAutoMode, handleNewApi, state.api]);

  useEffect(() => {
    // Set up a polling interval to check for a connected API every 1 second
    const pollingInterval = setInterval(() => {
      // Find the saved API for the current chain and endpoint
      const savedApi = apisContext?.apis[chainGenesisHash ?? '']?.find((sApi) => sApi.endpoint === endpoint);

      // If the saved API is connected, update the state and clear the polling interval
      if (savedApi?.api?.isConnected) {
        dispatch({ payload: savedApi.api, type: 'SET_API' });
        clearInterval(pollingInterval);
      }
    }, 1000);

    return () => clearInterval(pollingInterval);
  }, [apisContext, chainGenesisHash, endpoint]);

  return state.api;
}
