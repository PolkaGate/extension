// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

// import Memoize from 'memoize-one';
import memoize from 'memoizee';

// var memoize = require("memoizee");
import { ApiPromise, WsProvider } from '@polkadot/api';

import LCConnector from './api/lightClient-connect';

async function getApi(endpoint: string): Promise<ApiPromise> {
  if (endpoint.startsWith('wss')) {
    const wsProvider = new WsProvider(endpoint);

    return await ApiPromise.create({ provider: wsProvider });
  } else {
    return await LCConnector(endpoint);
  }
}

// export default getApi;
// export default memoize(getApi);
export default getApi;
