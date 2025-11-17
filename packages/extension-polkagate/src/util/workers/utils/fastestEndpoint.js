// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

/**
 * Connects to multiple endpoints and returns the fastest one.
 * Automatically disconnects all other providers.
 *
 * @param {{ value: string }[]} endpoints
 */
export async function fastestEndpoint (endpoints) {
  // Filter invalid endpoints
  const validEndpoints = endpoints
    .map(({ value }) => value)
    .filter(
      (value) =>
        !/^wss:\/\/\d+$/.test(value) &&
        !value.includes('onfinality') &&
        !value.startsWith('light')
    );

  if (!validEndpoints.length) {
    throw new Error('No valid endpoints provided');
  }

  // Create all providers
  const providers = validEndpoints.map((value) => new WsProvider(value));

  // Wrap each ApiPromise creation in an object, so we keep the link between api and provider
  const apiPromises = providers.map((provider) =>
    ApiPromise.create({ provider })
      .then((api) => ({ api, provider })) // attach provider reference
      .catch((error) => {
        provider.disconnect().catch(() => null);
        throw error;
      })
  );

  // Get the fastest connection
  const { api, provider } = await Promise.any(apiPromises);

  // Disconnect all other providers (non-blocking)
  Promise.all(
    providers.map((p) =>
      p === provider
        ? Promise.resolve()
        : p.disconnect().catch(() => null)
    )
  ).catch(() => null);

  return { api, provider, selectedEndpoint: provider.endpoint };
}
