// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';

/**
 * @param {{ value: string; }[]} endpoints
 */
export async function fastestEndpoint (endpoints) {
  let connection;

  const connections = endpoints.map(({ value }) => {
    const wsProvider = new WsProvider(value);

    connection = ApiPromise.create({ provider: wsProvider });

    return {
      connection,
      wsProvider
    };
  });

  const api = await Promise.any(connections.map(({ connection }) => connection));

  return {
    api,
    connections
  };
}
