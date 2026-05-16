// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

import { shouldSkipEndpointOption } from '../../endpoint';

const API_READY_TIMEOUT = 30_000;
const ENDPOINT_PROBE_TIMEOUT = 10_000;
const ENDPOINT_PROBE_METHOD = 'chain_getBlockHash';
const ENDPOINT_PROBE_PARAMS = [0];

/**
 * @param {WsProvider} provider
 */
function disconnectProvider(provider) {
  return provider.disconnect().catch(() => undefined);
}

/**
 * @param {WsProvider} provider
 * @param {number} [timeout=API_READY_TIMEOUT]
 */
function createApiForEndpointWithTimeout(provider, timeout = API_READY_TIMEOUT) {
  // eslint-disable-next-line promise/param-names
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('API isReady timeout')), timeout);
  });

  return Promise.race([
    (async () => {
      const api = await ApiPromise.create({ provider });

      await api.isReady;

      return { api, provider };
    })(),
    timeoutPromise
  ]);
}

/**
 * @param {WebSocket | undefined} websocket
 */
function closeWebSocket(websocket) {
  if (!websocket) {
    return;
  }

  try {
    websocket.close();
  } catch {
    // ignore close errors; the probe is already done
  }
}

/**
 * @param {string} endpoint
 * @param {number} [timeout=ENDPOINT_PROBE_TIMEOUT]
 */
function probeEndpoint(endpoint, timeout = ENDPOINT_PROBE_TIMEOUT) {
  /**
   * @type {WebSocket | undefined}
   */
  let websocket;
  /**
   * @type {string | number | NodeJS.Timeout | undefined}
   */
  let timer;
  let settled = false;

  const close = () => {
    settled = true;
    clearTimeout(timer);
    closeWebSocket(websocket);
  };

  const promise = new Promise((resolve, reject) => {
    if (typeof WebSocket === 'undefined') {
      reject(new Error('WebSocket is not available'));

      return;
    }

    const startedAt = Date.now();

    websocket = new WebSocket(endpoint);
    timer = setTimeout(() => {
      if (settled) {
        return;
      }

      close();
      reject(new Error('Endpoint probe timeout'));
    }, timeout);

    websocket.onopen = () => {
      if (!websocket) {
        return;
      }

      websocket.send(JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: ENDPOINT_PROBE_METHOD,
        params: ENDPOINT_PROBE_PARAMS
      }));
    };

    websocket.onmessage = (event) => {
      if (settled) {
        return;
      }

      const response = JSON.parse(event.data);
      const genesisHash = response.result;

      console.info(`${endpoint} genesisHash:`, genesisHash);

      const delay = Date.now() - startedAt;

      close();
      resolve({ delay, endpoint, genesisHash });
    };

    websocket.onerror = () => {
      if (settled) {
        return;
      }

      close();
      reject(new Error('Endpoint probe failed'));
    };
  });

  return { close, promise };
}

/**
 * @param {{ value: string; }[]} endpoints
 * @param {number} [timeout=API_READY_TIMEOUT]
 */
export async function fastestEndpoint(endpoints, timeout = API_READY_TIMEOUT) {
  /**
   * @type {any[]}
   */
  const validEndpoints = endpoints.reduce((acc, { value }) => {
    if (!shouldSkipEndpointOption(value)) {
      // @ts-ignore
      acc.push(value);
    }

    return acc;
  }, []);

  if (!validEndpoints.length) {
    throw new Error('No valid endpoints provided');
  }

  const probes = validEndpoints.map((endpoint) => {
    const probe = probeEndpoint(endpoint);

    return {
      ...probe,
      promise: probe.promise.catch((error) => {
        console.warn(`${endpoint} probe failed: ${error.message}`);

        return Promise.reject(error);
      })
    };
  });

  let fastestEndpoint;

  try {
    fastestEndpoint = await Promise.any(probes.map(({ promise }) => promise));
  } catch (error) {
    throw new Error('All endpoints failed the lightweight probe', { cause: error });
  } finally {
    probes.forEach(({ close }) => close());
  }

  const provider = new WsProvider(fastestEndpoint.endpoint);

  let connected;

  try {
    connected = await createApiForEndpointWithTimeout(provider, timeout);
  } catch (error) {
    await disconnectProvider(provider);

    throw error;
  }

  return {
    api: connected.api,
    selectedEndpoint: connected.provider.endpoint
  };
}
