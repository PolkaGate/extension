// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { ApiPromise, WsProvider } from '@polkadot/api';

/**
 * Connects to multiple endpoints and returns the fastest one.
 * Automatically disconnects all other providers.
 *
 * @param {{ value: string }[]} endpoints
 */
export async function fastestEndpoint(endpoints) {
  const validEndpoints = endpoints.reduce((acc, { value }) => {
    if (
      !/^wss:\/\/\d+$/.test(value) &&
      !value.includes('onfinality') &&
      !value.startsWith('light')) {
      acc.push(value);
    }

    return acc;
  }, []);

  if (!validEndpoints.length) {
    throw new Error('No valid endpoints provided');
  }

  const providers = validEndpoints.map((endpoint) => new WsProvider(endpoint));

  const race = providers.map((provider) => provider.isReady
    .then(() => provider)
    .catch((error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))));

  let fastestProvider;

  try {
    fastestProvider = await Promise.any(race);
  } catch (e) {
    providers.forEach((provider) => {
      provider.disconnect().catch(() => undefined);
    });
    throw new Error('All endpoints failed to connect', { cause: e });
  }

  providers.forEach((provider) => {
    if (provider.endpoint !== fastestProvider.endpoint) {
      provider.disconnect().catch(() => undefined);
    }
  });

  return {
    api: await ApiPromise.create({ provider: fastestProvider }),
    selectedEndpoint: fastestProvider.endpoint
  };
}
