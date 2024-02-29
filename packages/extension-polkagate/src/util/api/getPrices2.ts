// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { OutputPrices, PricesType } from '../types';

export default async function getPrices2 (priceIds: string[], currency = 'usd'): Promise<OutputPrices | null> {
  try {
    console.log(' getting prices for:', priceIds);

    const prices = await getReq(`https://api.coingecko.com/api/v3/simple/price?ids=${priceIds}&vs_currencies=${currency}`, {});

    // if (chainNames.includes('pendulum')) {
    //   const pendulumPrice = await getReq(`https://min-api.cryptocompare.com/data/price?fsym=PEN&tsyms=USD`, {});

    //   if (pendulumPrice?.USD) {
    //     prices.pendulum = { usd: pendulumPrice.USD };
    //   }
    // }

    // prices.westend = { usd: 0 };
    const outputObjectPrices: PricesType = {};

    for (const [key, value] of Object.entries(prices)) {
      outputObjectPrices[key] = value[currency];
    }

    return { currencyCode: currency ,date: Date.now(), prices: outputObjectPrices };
  } catch (e) {
    console.log('error while fetching prices:', e);

    return null;
  }
}

function getReq(api: string, data: Record<string, unknown> = {}, option?: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request.get(api, {
    data,
    ...option
  });
}
