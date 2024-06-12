// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { options } from '@acala-network/api';

import { ApiPromise, WsProvider } from '@polkadot/api';

export async function fastestEndpoint (chainEndpoints, isACA) {
  let connection;

  const connections = chainEndpoints.map((endpoint) => {
    const wsProvider = new WsProvider(endpoint.value);

    if (isACA) {
      connection = new ApiPromise(options({ provider: wsProvider })).isReady;
    } else {
      connection = ApiPromise.create({ provider: wsProvider });
    }

    return {
      connection,
      wsProvider
    };
  });

  const api = await Promise.any(connections.map((con) => con.connection));

  return {
    api,
    connections
  };
}
