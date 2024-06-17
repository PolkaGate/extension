// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import request from 'umi-request';

import { PricesType } from '../types';

/** some chains have a different priceId than its sanitizedChainName,
 * hence we will replace their price Id using  EXTRA_PRICE_IDS */
export const EXTRA_PRICE_IDS: Record<string, string> = {
  nodle: 'nodle-network',
  parallel: 'parallel-finance',
  pendulum: 'pendulum-chain'
};

export default async function getPrices(priceIds: string[], currencyCode = 'usd') {
  console.log(' getting prices for:', priceIds.sort());

  const revisedPriceIds = priceIds.map((item) => (EXTRA_PRICE_IDS[item] || item));

  const prices = await getReq(`https://api.coingecko.com/api/v3/simple/price?ids=${revisedPriceIds}&vs_currencies=${currencyCode}&include_24hr_change=true`, {});

  const outputObjectPrices: PricesType = {};

  for (const [key, value] of Object.entries(prices)) {
    outputObjectPrices[key] = { change: value[`${currencyCode}_24h_change`] as number, value: value[currencyCode] as number };
  }

  const price = { currencyCode, date: Date.now(), prices: outputObjectPrices };

  return price;
}

function getReq(api: string, data: Record<string, unknown> = {}, option?: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request.get(api, {
    data,
    ...option
  });
}
