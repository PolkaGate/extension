// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { Prices } from '../types';

export default async function getPrices (chainNames: string[], currency = 'usd'): Promise<Prices> {
  const prices = await getReq(`https://api.coingecko.com/api/v3/simple/price?ids=${chainNames}&vs_currencies=${currency}`, {});

  prices.westend = { usd: 0 };

  return { date: Date.now(), prices };
}

function getReq (api: string, data: Record<string, any> = {}, option?: Record<string, any>): Promise<Record<string, any>> {
  return request.get(api, {
    data,
    ...option
  });
}
