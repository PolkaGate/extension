// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
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
    if (/^wss:\/\/\d+$/.test(value) || (value).includes('onfinality')) {
      return undefined;
    }

    const wsProvider = new WsProvider(value);

    connection = ApiPromise.create({ provider: wsProvider });

    return {
      connection,
      wsProvider
    };
  }).filter((i) => !!i);

  const api = await Promise.any(connections.map(({ connection }) => connection));

  return {
    api,
    connections
  };
}
