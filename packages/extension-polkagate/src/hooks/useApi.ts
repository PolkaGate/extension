// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useCallback, useContext, useEffect, useReducer } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import EndpointManager from '../class/endpointManager';
import { APIContext } from '../components';
import LCConnector from '../util/api/lightClient-connect';
import { AUTO_MODE } from '../util/constants';
import { fastestConnection } from '../util/utils';
import { useEndpoint, useEndpoints, useGenesisHash } from '.';

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
  const { payload, type } = action;

  switch (type) {
    case 'SET_API':
      return { ...state, api: payload, error: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: payload };
    case 'SET_ERROR':
      return { ...state, error: payload, isLoading: false };
    default:
      return state;
  }
};

const endpointManager = new EndpointManager();
const isAutoMode = (e: string) => e === AUTO_MODE.value;

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
        isAuto: true,
        timestamp: Date.now()
      };
      const savedEndpoints = endpointManager.getEndpoints();

      if (addressKey) {
        endpointManager.set(addressKey, chainKey, newEndpoint);
      } else {
        for (const address in savedEndpoints) {
          if (savedEndpoints[address]?.[chainKey]) {
            endpointManager.set(address, chainKey, newEndpoint);
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

    // console.log('Successfully connected to existing API for genesis hash:', genesisHash);

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
      toSaveApi = toSaveApi.filter((sApi) => !isAutoMode(sApi.endpoint));
    }

    // Add the new API entry
    toSaveApi.push({
      api,
      endpoint,
      isRequested: false
    });

    apisContext.apis[genesisHash] = toSaveApi;
    apisContext.setIt({ ...apisContext.apis });
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
    const apisForGenesis = apisContext.apis[genesisHash];

    const autoModeExists = apisForGenesis?.some(({ endpoint }) => isAutoMode(endpoint));

    if (autoModeExists) {
      return;
    }

    const result = !findNewEndpoint && connectToExisted(String(address), genesisHash);

    if (result) {
      return;
    }

    const wssEndpoints = endpoints.filter(({ value }) => String(value).startsWith('wss')); // to filter possible light client

    dispatch({ payload: true, type: 'SET_LOADING' });

    // Finds the fastest available endpoint and connects to it
    const { api, selectedEndpoint } = await fastestConnection(wssEndpoints);

    if (!api || !selectedEndpoint) {
      return;
    }

    const accountAddress =
      findNewEndpoint
        ? address
        : undefined;

    updateEndpoint(accountAddress, genesisHash, selectedEndpoint, () => handleNewApi(api, selectedEndpoint, true));
  }, [apisContext.apis, connectToExisted, endpoints, handleNewApi, updateEndpoint]);

  const addApiRequest = useCallback((endpointToRequest: string, genesisHash: string) => {
    const toSaveApi = apisContext.apis[genesisHash] ?? [];

    toSaveApi.push({ endpoint: endpointToRequest, isRequested: true });

    apisContext.apis[genesisHash] = toSaveApi;
    apisContext.setIt({ ...apisContext.apis });
  }, [apisContext]);

  // check api in the context
  const isInContext = useCallback((endpoint: string, genesisHash: string) => {
    // Check if there is a saved API that is already connected
    const savedApi = apisContext?.apis[genesisHash]?.find((sApi) => sApi.endpoint === endpoint);

    // If the API is already being requested, skip the connection process
    if (savedApi?.isRequested) {
      return true;
    }

    if (savedApi?.api?.isConnected) {
      dispatch({ payload: savedApi.api, type: 'SET_API' });

      return true;
    }

    return false;
  }, [apisContext?.apis]);

  // Handles connection request to a manual endpoint
  const handleApiWithChain = useCallback((manualEndpoint: string, genesisHash: string) => {
    if (isInContext(manualEndpoint, genesisHash)) {
      return;
    }

    addApiRequest(manualEndpoint, genesisHash);

    connectToEndpoint(manualEndpoint).catch(console.error);
  }, [addApiRequest, connectToEndpoint, isInContext]);

  useEffect(() => {
    // if _endpoint & _genesisHash are available means useApiWithChain2 is trying to create a new connection!
    if (_endpoint && _genesisHash) {
      handleApiWithChain(_endpoint, _genesisHash);
    }
  }, [_endpoint, _genesisHash, handleApiWithChain]);

  // Manages the API connection when the address, endpoint, or genesis hash changes
  useEffect(() => {
    // @ts-expect-error to bypass access to private prop
    if (!address || !chainGenesisHash || !endpoint || state.isLoading || state?.api?._options?.provider?.endpoint === endpoint) {
      return;
    }

    // Validate the endpoint format (it should start with 'wss', 'light', or be in auto mode)
    if (!endpoint.startsWith('wss') && !endpoint.startsWith('light') && !isAutoMode(endpoint)) {
      console.log('📌 📌  Unsupported endpoint detected 📌 📌 ', endpoint);

      return;
    }

    // To address the delay issue when setting the endpoint in this hook,
    // we manually compare the endpoint obtained from `useEndpoint` (local state)
    // and the endpoint stored in `EndpointManager`.
    // If they are not equal, it means the state has not been updated yet,
    // so we log a message and return early to prevent further processing.
    const endpointFromTheManager = endpointManager.get(String(address), chainGenesisHash)?.endpoint; // Endpoint stored in the manager

    // Check if the two endpoints are not synchronized
    if (endpoint !== endpointFromTheManager) {
      // console.log('📌 📌 Not updated yet! The endpoint in the manager is still different from the local one.');

      // Exit early to avoid further execution until the endpoints are in sync
      return;
    }

    // To provide api from context
    if (isInContext(endpoint, chainGenesisHash)) {
      return;
    }

    // If in auto mode, check existing connections or find a new one
    if (isAutoMode(endpoint)) {
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

    addApiRequest(endpoint, chainGenesisHash);
    // @ts-expect-error to bypass access to private prop
  }, [address, addApiRequest, chainGenesisHash, checkForNewOne, connectToEndpoint, endpoint, handleAutoMode, handleNewApi, isInContext, state?.api?._options?.provider?.endpoint, state.isLoading]);

  return state.api;
}
