// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { APIs, DropdownOption, EndpointType } from '@polkadot/extension-polkagate/src/util/types';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import EndpointManager from '@polkadot/extension-polkagate/src/class/endpointManager2';
import { APIContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { fastestConnection } from '@polkadot/extension-polkagate/src/util';
import { AUTO_MODE, AUTO_MODE_DEFAULT_ENDPOINT } from '@polkadot/extension-polkagate/src/util/constants';

const isAutoMode = (e: string) => e === AUTO_MODE.value;

const endpointManager = new EndpointManager();

/**
 * This component centralizes connection logic, caching, automatic endpoint selection, and request deduplication.
 *
 * @remarks
 * Behavior and responsibilities:
 * - Maintains a mapping of connected or previously created ApiPromise instances per genesis hash (state: `apis`).
 * - Exposes a `getApi` function that returns a Promise resolving to an ApiPromise (or undefined).
 *   - If a connected ApiPromise already exists for the requested genesisHash, it is returned immediately.
 *   - If a connection is in-flight, multiple callers share the same pending Promise.
 *   - If no connection exists, a new pending Promise is created and a connection attempt is started.
 *
 * - Keeps a queue of requested endpoints per genesis hash to avoid duplicate connection attempts (`requestedQueue`).
 *
 * - Tracks pending connection resolvers per genesis hash so all awaiting callers are resolved once a connection completes.
 *
 * - Initializes an EndpointManager2 instance asynchronously on mount and exposes it via internal state.
 *
 * - Supports "auto" mode endpoints (determined by `isAutoMode`) where the best/wss endpoint is chosen via `fastestConnection`.
 *   - When auto mode is requested and no auto-mode ApiPromise exists for the genesis hash, it triggers `handleAutoMode`
 *     to resolve/select an endpoint and create a connection.
 *
 * - When a new ApiPromise is created successfully, `handleNewApi`:
 *   - normalizes and stores the ApiPromise in the `apis` map (removing duplicates/endpoints as needed),
 *   - optionally clears other auto-mode endpoints if a new auto-mode API is added,
 *   - resolves any pending connection Promises for the corresponding genesis hash.
 *
 * - On connection errors, pending requests for the affected genesis hash are resolved with `undefined`.
 *
 * Implementation details:
 * - Uses refs (`apisRef`, `requestedQueue`, `pendingConnections`) to safely read/write mutable data in async callbacks
 *   without causing excessive re-renders or stale closures.
 *
 * - Uses `useEffect` to synchronize the `apisRef` with state and to initialize the EndpointManager2 singleton.
 *
 * - All public-facing asynchronous operations (like `getApi`) depend on the EndpointManager2 being initialized;
 *   callers receive `undefined` if the manager isn't ready or the genesisHash is falsy.
 *
 * Notes and caveats:
 * - Consumers should expect that getApi can resolve to undefined if no endpoint is available, the manager is not ready,
 *   or a connection failed.
 *
 * - This provider assumes endpoints returned from `useEndpoints(genesis)` include wss endpoints to be used for connections.
 *
 * - The component intentionally deduplicates concurrent requests for the same genesis hash/endpoint to avoid multiple
 *   identical connections.
 */
export default function ApiProvider ({ children }: { children: React.ReactNode }) {
  // const [genesis, setGenesis] = useState<string | undefined>(undefined);
  // const endpoints = useEndpoints(genesis);

  const [apis, setApis] = useState<APIs>({});

  const requestedQueue = useRef<Record<string, string[]>>({});
  // Store pending promises for each genesisHash
  const pendingConnections = useRef<
    Record<string, {
      promise: Promise<ApiPromise | undefined>;
      resolve(api: ApiPromise | undefined): void;
    }[]>
  >({});

  const apisRef = useRef<APIs>({});

  // Keep ref in sync with state
  useEffect(() => {
    apisRef.current = apis;
  }, [apis]);

  const updateEndpoint = useCallback((chainKey: string, selectedEndpoint: string, cbFunction?: () => void) => {
    try {
      const newEndpoint = {
        checkForNewOne: false,
        endpoint: selectedEndpoint,
        isAuto: true,
        timestamp: Date.now()
      };

      endpointManager.set(chainKey, newEndpoint);
      cbFunction?.();
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Resolve all pending promises for this genesisHash
  const resolvePendingConnections = useCallback((genesisHash: string, api: ApiPromise | undefined) => {
    const pending = pendingConnections.current[genesisHash];

    if (pending) {
      pending.forEach(({ resolve }) => resolve(api));
      delete pendingConnections.current[genesisHash];
    }
  }, []);

  const handleNewApi = useCallback((api: ApiPromise, endpoint: string, onAutoMode?: boolean) => {
    const genesisHash = String(api.genesisHash.toHex());

    setApis((prevApis) => {
      let toSaveApi = prevApis[genesisHash] ?? [];

      toSaveApi = toSaveApi.filter((sApi) => sApi.endpoint !== endpoint);

      if (onAutoMode) {
        toSaveApi = toSaveApi.filter((sApi) => !isAutoMode(sApi.endpoint));
      }

      toSaveApi.push({
        api,
        endpoint,
        isRequested: false
      });

      return {
        ...prevApis,
        [genesisHash]: toSaveApi
      };
    });

    // Resolve all waiting promises
    resolvePendingConnections(genesisHash, api);
  }, [resolvePendingConnections]);

  const handleAutoMode = useCallback(async (genesisHash: string, endpoints: DropdownOption[]) => {
    const apisForGenesis = apisRef.current[genesisHash];
    const autoModeExists = apisForGenesis?.some(({ endpoint }) => isAutoMode(endpoint));

    if (autoModeExists) {
      return;
    }

    const wssEndpoints = endpoints.filter(({ value }) => String(value).startsWith('wss'));

    const { api, selectedEndpoint } = await fastestConnection(wssEndpoints);

    if (!api || !selectedEndpoint) {
      resolvePendingConnections(genesisHash, undefined);

      return;
    }

    updateEndpoint(genesisHash, selectedEndpoint, () => handleNewApi(api, selectedEndpoint, true));
  }, [handleNewApi, updateEndpoint, resolvePendingConnections]);

  const connectToEndpoint = useCallback(async (endpointToConnect: string) => {
    try {
      const wsProvider = new WsProvider(endpointToConnect);
      const newApi = await ApiPromise.create({ provider: wsProvider });

      handleNewApi(newApi, endpointToConnect);
    } catch (error) {
      console.error('Connection error:', error);
      // Resolve pending with undefined on error
      const genesisHash = Object.keys(pendingConnections.current).find((key) =>
        pendingConnections.current[key].length > 0
      );

      if (genesisHash) {
        resolvePendingConnections(genesisHash, undefined);
      }
    }
  }, [handleNewApi, resolvePendingConnections]);

  const requestApiConnection = useCallback((genesisHash: string, endpoint: EndpointType | undefined, endpoints: DropdownOption[]) => {
    if (!endpoint?.endpoint || !endpointManager) {
      return;
    }

    const isAlreadyRequested = requestedQueue.current[genesisHash]?.includes(endpoint.endpoint);

    if (isAlreadyRequested) {
      return;
    }

    // Mark as requested
    if (!requestedQueue.current[genesisHash]) {
      requestedQueue.current[genesisHash] = [];
    }

    requestedQueue.current[genesisHash].push(endpoint.endpoint);

    if (isAutoMode(endpoint.endpoint)) {
      handleAutoMode(genesisHash, endpoints).catch(console.error);

      return;
    }

    if (endpoint.endpoint.startsWith('wss')) {
      connectToEndpoint(endpoint.endpoint).catch(console.error);
    }
  }, [connectToEndpoint, handleAutoMode]);

  const getApi = useCallback(async (genesisHash: string | null | undefined, endpoints: DropdownOption[]): Promise<ApiPromise | undefined> => {
    if (!genesisHash) {
      return Promise.resolve(undefined);
    }

    let endpoint = endpointManager.get(genesisHash);

    if (!endpoint) {
      endpoint = AUTO_MODE_DEFAULT_ENDPOINT;

      endpointManager.set(genesisHash, AUTO_MODE_DEFAULT_ENDPOINT);
    }

    if (!endpoint) {
      console.warn('No endpoint found for', genesisHash);

      return Promise.resolve(undefined);
    }

    // Check if API already exists and is connected
    const apiList = apisRef.current[genesisHash];
    const availableApi = apiList?.find(({ api }) => api?.isConnected);

    if (availableApi?.api) {
      return Promise.resolve(availableApi.api);
    }

    // TODO: maybe different endpoint is pending! needs more check
    // Check if connection is already pending
    if (pendingConnections.current[genesisHash]?.length > 0) {
      // Return existing promise
      return pendingConnections.current[genesisHash][0].promise;
    }

    // Create new promise for this connection
    // initialize resolvePromise with a noop so it's always defined for the push below,
    // then overwrite it synchronously inside the Promise executor.
    let resolvePromise: (api: ApiPromise | undefined) => void = () => undefined;
    const promise = new Promise<ApiPromise | undefined>((resolve) => {
      resolvePromise = resolve;
    });

    if (!pendingConnections.current[genesisHash]) {
      pendingConnections.current[genesisHash] = [];
    }

    pendingConnections.current[genesisHash].push({
      promise,
      resolve: resolvePromise
    });

    // Start connection
    requestApiConnection(genesisHash, endpoint, endpoints);

    return promise;
  }, [requestApiConnection]);

  return (
    <APIContext.Provider value={{ apis, getApi }}>
      {children}
    </APIContext.Provider>
  );
}
