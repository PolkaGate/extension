// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { APIs, DropdownOption, EndpointType } from '@polkadot/extension-polkagate/src/util/types';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import EndpointManager from '@polkadot/extension-polkagate/src/class/endpointManager';
import { APIContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { fastestConnection } from '@polkadot/extension-polkagate/src/util';
import LCConnector from '@polkadot/extension-polkagate/src/util/api/lightClient-connect';
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
 * - Initializes an EndpointManager instance asynchronously on mount and exposes it via internal state.
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
 * - Uses `useEffect` to synchronize the `apisRef` with state and to initialize the EndpointManager singleton.
 *
 * - All public-facing asynchronous operations (like `getApi`) depend on the EndpointManager being initialized;
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
  const [apis, setApis] = useState<APIs>({});

  const requestedQueue = useRef<Record<string, string[]>>({});
  // Store pending promises for each genesisHash
  const pendingConnections = useRef<
    Record<string, Record<string, {
      promise: Promise<ApiPromise | undefined>;
      resolve(api: ApiPromise | undefined): void;
    }>>
  >({});

  const apisRef = useRef<APIs>({});

  // Keep ref in sync with state
  useEffect(() => {
    apisRef.current = apis;
  }, [apis]);

  const updateEndpoint = useCallback((genesisHash: string, selectedEndpoint: string, cbFunction?: () => void) => {
    try {
      const newEndpoint = {
        checkForNewOne: false,
        endpoint: selectedEndpoint,
        isAuto: true,
        timestamp: Date.now()
      };

      endpointManager.set(genesisHash, newEndpoint);
      cbFunction?.();
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Resolve all pending promises for this genesisHash
  const resolvePendingConnections = useCallback((genesisHash: string, api: ApiPromise | undefined, endpoint: string | undefined) => {
    const pending = endpoint && pendingConnections.current[genesisHash][endpoint];

    if (pending) {
      pending.resolve(api);
      delete pendingConnections.current[genesisHash][endpoint];

      // If there are no more pending endpoints for this genesisHash, remove the empty object
      if (pendingConnections.current[genesisHash] && Object.keys(pendingConnections.current[genesisHash]).length === 0) {
        delete pendingConnections.current[genesisHash];
      }
    }

    // Clear request mark for this endpoint
    const rq = requestedQueue.current[genesisHash];

    if (rq) {
      const filtered = rq.filter((e) => e !== endpoint);

      filtered.length ? (requestedQueue.current[genesisHash] = filtered) : delete requestedQueue.current[genesisHash];
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
        endpoint
      });

      return {
        ...prevApis,
        [genesisHash]: toSaveApi
      };
    });

    // Resolve all waiting promises
    resolvePendingConnections(genesisHash, api, onAutoMode ? AUTO_MODE.value : endpoint);
  }, [resolvePendingConnections]);

  const handleAutoMode = useCallback(async (genesisHash: string, endpoints: DropdownOption[]) => {
    const wssEndpoints = endpoints.filter(({ value }) => String(value).startsWith('wss'));

    const { api, selectedEndpoint } = await fastestConnection(wssEndpoints);

    if (!api || !selectedEndpoint) {
      resolvePendingConnections(genesisHash, undefined, selectedEndpoint);

      return;
    }

    updateEndpoint(genesisHash, selectedEndpoint, () => handleNewApi(api, selectedEndpoint, true));
  }, [handleNewApi, updateEndpoint, resolvePendingConnections]);

  const connectToEndpoint = useCallback(async (genesisHash: string, endpointToConnect: string) => {
    try {
      const wsProvider = new WsProvider(endpointToConnect);
      const newApi = await ApiPromise.create({ provider: wsProvider });

      handleNewApi(newApi, endpointToConnect);
    } catch (error) {
      console.error('Connection error:', error);
      // Resolve pending with undefined on error
      resolvePendingConnections(genesisHash, undefined, endpointToConnect);
    }
  }, [handleNewApi, resolvePendingConnections]);

  const connectToLightClient = useCallback(async (genesisHash: string, endpointToConnect: string) => {
    try {
      const newApi = await LCConnector(endpointToConnect);

      handleNewApi(newApi, endpointToConnect);
    } catch (error) {
      console.error('Connection error:', error);
      // Resolve pending with undefined on error
      resolvePendingConnections(genesisHash, undefined, endpointToConnect);
    }
  }, [handleNewApi, resolvePendingConnections]);

  const requestApiConnection = useCallback((genesisHash: string, endpoint: EndpointType | undefined, endpoints: DropdownOption[]) => {
    const endpointValue = endpoint?.endpoint;

    if (!endpointValue || !endpointManager) {
      return;
    }

    const isAlreadyRequested = requestedQueue.current[genesisHash]?.includes(endpointValue);

    if (isAlreadyRequested) {
      return;
    }

    // Mark as requested
    (requestedQueue.current[genesisHash] ??= []).push(endpointValue);

    // If in auto mode find the fastest endpoint
    if (isAutoMode(endpointValue)) {
      handleAutoMode(genesisHash, endpoints).catch(console.error);

      return;
    }

    // Connect to a WebSocket endpoint
    if (endpointValue.startsWith('wss')) {
      connectToEndpoint(genesisHash, endpointValue).catch(console.error);
    }

    // Connect to a light client endpoint if provided
    if (endpointValue.startsWith('light')) {
      connectToLightClient(genesisHash, endpointValue).catch(console.error);
    }
  }, [connectToEndpoint, connectToLightClient, handleAutoMode]);

  const getApi = useCallback(async (genesisHash: string | null | undefined, endpoints: DropdownOption[]): Promise<ApiPromise | undefined> => {
    if (!genesisHash) {
      return Promise.resolve(undefined);
    }

    let endpoint = endpointManager.get(genesisHash);

    if (!endpoint) {
      endpoint = { ...AUTO_MODE_DEFAULT_ENDPOINT, timestamp: Date.now() };

      endpointManager.set(genesisHash, endpoint);
    }

    const endpointValue = endpoint.endpoint;

    if (!endpoint || !endpointValue) {
      console.warn('No endpoint found for', genesisHash);

      return Promise.resolve(undefined);
    }

    // Check if API already exists and is connected
    const apiList = apisRef.current[genesisHash];
    const availableApi = apiList?.find(({ api, endpoint }) => api?.isConnected && endpoint === endpointValue)?.api;

    if (availableApi) {
      return Promise.resolve(availableApi);
    }

    // Check if connection is already pending
    if (pendingConnections.current[genesisHash]?.[endpointValue]) {
      // Return existing promise
      return pendingConnections.current[genesisHash][endpointValue].promise;
    }

    // Create new promise for this connection
    // initialize resolvePromise with a noop so it's always defined for assignment below,
    // then overwrite it synchronously inside the Promise executor.
    let resolvePromise: (api: ApiPromise | undefined) => void = () => undefined;

    const promise = new Promise<ApiPromise | undefined>((resolve) => {
      resolvePromise = resolve;
    });

    if (!pendingConnections.current[genesisHash]) {
      pendingConnections.current[genesisHash] = {};
    }

    pendingConnections.current[genesisHash][endpointValue] = {
      promise,
      resolve: resolvePromise
    };

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
