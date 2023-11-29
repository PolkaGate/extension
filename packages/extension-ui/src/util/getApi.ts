// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */

import { ApiPromise, WsProvider } from '@polkadot/api';

import LCConnector from './api/lightClient-connect';

async function getApi(endpoint: string): Promise<ApiPromise | undefined> {
  if (endpoint.startsWith('wss')) {
    const wsProvider = new WsProvider(endpoint);

    return await ApiPromise.create({ provider: wsProvider });
  } else if (endpoint.startsWith('light')) {
    return await LCConnector(endpoint);
  } else {
    throw new Error(`Invalid endpoint: ${endpoint}`);
  }
}

export default getApi;
