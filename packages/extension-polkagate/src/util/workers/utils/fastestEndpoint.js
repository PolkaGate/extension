// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { ApiPromise, WsProvider } from '@polkadot/api';

// helper to wrap API creation with timeout
const createApiWithTimeout = async(provider, timeout = 7000) => {
  const apiPromise = ApiPromise.create({ provider });
  const timeoutPromise = new Promise((_resolve, reject) =>
    setTimeout(() => reject(new Error('API isReady timeout')), timeout)
  );
  const api = await Promise.race([apiPromise, timeoutPromise]);

  await api.isReady;

  return { api, provider };
};

/**
 * Connects to multiple endpoints and returns the fastest working API.
 * Automatically disconnects all other providers.
 *
 * @param {{ value: string }[]} endpoints
 * @param {number} [timeout=7000] - max ms to wait for API readiness per endpoint
 */
export async function fastestEndpoint(endpoints, timeout = 7000) {
  // filter out known-bad or light endpoints
  const validEndpoints = endpoints.reduce((acc, { value }) => {
    if (
      !/^wss:\/\/\d+$/.test(value) &&
      !value.includes('onfinality') &&
      !value.startsWith('light')
    ) {
      acc.push(value);
    }

    return acc;
  }, []);

  if (!validEndpoints.length) {
    throw new Error('No valid endpoints provided');
  }

  const providers = validEndpoints.map((endpoint) => new WsProvider(endpoint));

  // start all API initializations in parallel
  const race = providers.map((p) =>
    createApiWithTimeout(p, timeout).catch((e) => {
      // log and continue; will be ignored by Promise.any
      console.warn(`${p.endpoint} failed: ${e.message}`);

      return Promise.reject(e);
    })
  );

  let fastest;

  try {
    fastest = await Promise.any(race);
  } catch (e) {
    // all endpoints failed → disconnect all
    await Promise.all(
      providers.map((p) => p.disconnect().catch(() => undefined))
    );
    throw new Error('All endpoints failed to connect', { cause: e });
  }

  // fire-and-forget disconnect of losing APIs
  Promise.all(
    providers.map((p) => {
      if (p !== fastest.provider) {
        return p.disconnect().catch(() => undefined);
      }

      return Promise.resolve();
    })
  ).catch((e) => console.error('Error disconnecting losing providers:', e));

  return {
    api: fastest.api,
    selectedEndpoint: fastest.provider.endpoint
  };
}
