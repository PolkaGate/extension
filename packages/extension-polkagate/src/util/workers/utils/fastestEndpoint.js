// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

/**
 * @param {{ value: string; }[]} endpoints
 */
export async function fastestEndpoint (endpoints) {
  let connection;

  const connections = endpoints.map(({ value }) => {
    // Check if e.value matches the pattern 'wss://<any_number>'
    // ignore due to its rate limits
    if (/^wss:\/\/\d+$/.test(value) || (value).includes('onfinality') || value.startsWith('light')) {
      return undefined;
    }

    const wsProvider = new WsProvider(value);

    connection = ApiPromise.create({ provider: wsProvider });

    return {
      connection,
      connectionEndpoint: value,
      wsProvider
    };
  }).filter((i) => !!i);

  const api = await Promise.any(connections.map(({ connection }) => connection));

  // Find the matching connection that created this API
  // @ts-ignore
  const notConnectedEndpoint = connections.filter(({ connectionEndpoint }) => connectionEndpoint !== api?._options?.provider?.endpoint);
  // @ts-ignore
  const connectedEndpoint = connections.find(({ connectionEndpoint }) => connectionEndpoint === api?._options?.provider?.endpoint);

  notConnectedEndpoint.forEach(({ wsProvider }) => {
    wsProvider.disconnect().catch(() => null);
  });

  return {
    api,
    connections: connectedEndpoint ? [connectedEndpoint] : []
  };
}
