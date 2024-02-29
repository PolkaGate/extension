// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { Prices2, PricesType } from '../types';

async function updateStorage (newPrice: Prices2) {
  const load = await chrome.storage.local.get('prices2');

  const savedPrices = load && load.prices2 ? JSON.parse(load.prices2 as string) as Prices2[] : [];

  const index = savedPrices.findIndex((priceItem) => priceItem.currencyCode === newPrice.currencyCode);

  index === -1
    ? savedPrices.push(newPrice)
    : savedPrices[index] = newPrice;

  await chrome.storage.local.set({ prices2: JSON.stringify(savedPrices) }).catch(console.error);
}

export default async function getPrices2 (priceIds: string[], currency = 'usd') {
  try {
    console.log(' getting prices for:', priceIds);

    const prices = await getReq(`https://api.coingecko.com/api/v3/simple/price?ids=${priceIds}&vs_currencies=${currency}&include_24hr_change=true`, {});

    const outputObjectPrices: PricesType = {};

    for (const [key, value] of Object.entries(prices)) {
      outputObjectPrices[key] = { price: value[currency], change: value[`${currency}_24h_change`] };
    }

    const price = { currencyCode: currency, date: Date.now(), prices: outputObjectPrices };

    await updateStorage(price);

    // return price;
  } catch (e) {
    console.log('error while fetching prices:', e);
  }
}

function getReq (api: string, data: Record<string, unknown> = {}, option?: Record<string, unknown>): Promise<Record<string, unknown>> {
  return request.get(api, {
    data,
    ...option
  });
}
