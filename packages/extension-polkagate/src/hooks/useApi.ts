// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useCallback, useContext, useEffect, useReducer } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { APIContext } from '../components';
import LCConnector from '../util/api/lightClient-connect';
import { AUTO_MODE } from '../util/constants';
import { fastestConnection } from '../util/utils';
import { EndpointManager, useEndpoint, useEndpoints, useGenesisHash } from '.';

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

// Create a singleton EndpointManager
const endpointManager = new EndpointManager();

export default function useApi(address: AccountId | string | undefined, stateApi?: ApiPromise, _endpoint?: string, _genesisHash?: string): ApiPromise | undefined {
  const { checkForNewOne, endpoint } = useEndpoint(address, _endpoint);
  const apisContext = useContext(APIContext);
  const chainGenesisHash = useGenesisHash(address, _genesisHash);
  const endpoints = useEndpoints(chainGenesisHash);

  const [state, dispatch] = useReducer(apiReducer, {
    api: stateApi,
    error: null,
    isLoading: false
  });

  // This function is called exclusively in auto mode to update the account's "auto mode" endpoint
  // with the fastest endpoint available.
  const updateEndpoint = useCallback((addressKey: string | undefined, chainKey: string, selectedEndpoint: string, cbFunction?: () => void) => {
    try {
      const newEndpoint = {
        checkForNewOne: false,
        endpoint: selectedEndpoint,
        isOnManual: false,
        timestamp: Date.now()
      };
      const savedEndpoints = endpointManager.getEndpoints();

      if (addressKey) {
        endpointManager.setEndpoint(addressKey, chainKey, newEndpoint);
      } else {
        for (const address in savedEndpoints) {
          if (savedEndpoints[address]?.[chainKey]) {
            endpointManager.setEndpoint(address, chainKey, newEndpoint);
          }
        }
      }

      cbFunction?.();
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Checks if there is an available API connection, then will change the address endpoint to the available API's endpoint
  // Returns false if it was not successful to find an available API and true vice versa
  const connectToExisted = useCallback((address: string, genesisHash: string): boolean => {
    const apiList = apisContext.apis[genesisHash];

    if (!apiList) {
      return false;
    }

    const availableApi = apiList.find(({ api }) => api?.isConnected);

    if (!availableApi?.api) {
      return false;
    }

    dispatch({ payload: availableApi.api, type: 'SET_API' });
    updateEndpoint(address, genesisHash, availableApi.endpoint);

    console.log('Successfully connected to existing API for genesis hash:::', genesisHash);

    return true;
  }, [apisContext.apis, updateEndpoint]);

  // Handles a new API connection and updates the context with the new API
  const handleNewApi = useCallback((api: ApiPromise, endpoint: string, onAutoMode?: boolean) => {
    dispatch({ payload: api, type: 'SET_API' });

    const genesisHash = String(api.genesisHash.toHex());
    let toSaveApi = apisContext.apis[genesisHash] ?? [];

    // Remove any existing API with the same endpoint
    // it happens when the API is requested and not connected yet
    toSaveApi = toSaveApi.filter((sApi) => sApi.endpoint !== endpoint);

    // If in auto mode, remove any auto mode endpoint
    if (onAutoMode) {
      toSaveApi = toSaveApi.filter((sApi) => sApi.endpoint !== AUTO_MODE.value);
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
  const connectToEndpoint = useCallback(async (endpointToConnect: string) => {
    try {
      dispatch({ payload: true, type: 'SET_LOADING' });
      const wsProvider = new WsProvider(endpointToConnect);
      const newApi = await ApiPromise.create({ provider: wsProvider });

      handleNewApi(newApi, endpointToConnect);
    } catch (error) {
      dispatch({ payload: error as Error, type: 'SET_ERROR' });
    } finally {
      dispatch({ payload: false, type: 'SET_LOADING' });
    }
  }, [handleNewApi]);

  // Handles auto mode by finding the fastest endpoint and connecting to it
  const handleAutoMode = useCallback(async (address: string, genesisHash: string, findNewEndpoint: boolean) => {
    const apisForGenesis = apisContext.apis[genesisHash] ?? [];

    const autoModeExists = apisForGenesis.some(({ endpoint }) => endpoint === AUTO_MODE.value);

    if (autoModeExists) {
      return;
    }

    const result = !findNewEndpoint && connectToExisted(String(address), genesisHash);

    if (result) {
      return;
    }

    const withoutLC = endpoints.filter(({ value }) => String(value).startsWith('wss'));

    dispatch({ payload: true, type: 'SET_LOADING' });

    // Finds the fastest available endpoint and connects to it
    const { api, selectedEndpoint } = await fastestConnection(withoutLC);

    if (!api || !selectedEndpoint) {
      return;
    }

    updateEndpoint(undefined, genesisHash, selectedEndpoint, () => handleNewApi(api, selectedEndpoint, true));
  }, [apisContext.apis, connectToExisted, endpoints, handleNewApi, updateEndpoint]);

  // Manages the API connection when the address, endpoint, or genesis hash changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!address || !chainGenesisHash || !endpoint || state.isLoading === true || (state.api && state.api._options.provider?.endpoint === endpoint)) {
      return;
    }

    // Validate the endpoint format (it should start with 'wss', 'light', or be in auto mode)
    if (!endpoint.startsWith('wss') && !endpoint.startsWith('light') && endpoint !== AUTO_MODE.value) {
      console.log('📌 📌  Unsupported endpoint detected 📌 📌 ', endpoint);

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
      return;
    }

    // If in auto mode, check existing connections or find a new one
    if (endpoint === AUTO_MODE.value) {
      handleAutoMode(String(address), chainGenesisHash, !!checkForNewOne).catch(console.error);
    }

    // Connect to a WebSocket endpoint if provided
    if (endpoint.startsWith('wss')) {
      connectToEndpoint(endpoint).catch(console.error);
    }

    // Connect to a light client endpoint if provided
    if (endpoint.startsWith('light')) {
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
  }, [address, apisContext, apisContext.apis, chainGenesisHash, checkForNewOne, connectToEndpoint, endpoint, handleAutoMode, handleNewApi, state.api, state.isLoading]);

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
    }, 500);

    return () => clearInterval(pollingInterval);
  }, [apisContext, apisContext.apis, chainGenesisHash, endpoint]);

  return state.api;
}
