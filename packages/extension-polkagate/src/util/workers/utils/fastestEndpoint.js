// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

import { shouldSkipEndpointOption } from '../../endpoint';

const API_READY_TIMEOUT = 7000;

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
function createApiWithTimeout(provider, timeout = API_READY_TIMEOUT) {
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

  const providers = validEndpoints.map((endpoint) => new WsProvider(endpoint));
  let winnerChosen = false;
  const attempts = providers.map((provider) =>
    createApiWithTimeout(provider, timeout).catch((error) => {
      if (winnerChosen) {
        return Promise.reject(error);
      }

      console.warn(`${provider.endpoint} failed: ${error.message}`);

      return Promise.reject(error);
    })
  );

  let fastest;

  try {
    fastest = await Promise.any(attempts);
    winnerChosen = true;
  } catch (error) {
    await Promise.all(providers.map(disconnectProvider));

    throw new Error('All endpoints failed to connect', { cause: error });
  }

  Promise.all(
    providers.map((provider) =>
      provider !== fastest.provider
        ? disconnectProvider(provider)
        : Promise.resolve()
    )
  ).catch((error) => console.error('Error disconnecting losing providers:', error));

  return {
    api: fastest.api,
    selectedEndpoint: fastest.provider.endpoint
  };
}
