// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getPrices } from '@polkadot/extension-polkagate/src/util/api';

export function getRandomColor() {
  // Generate a random number between 0 and 16777215 (0xFFFFFF)
  const randomNumber = Math.floor(Math.random() * 16777215);
  // Convert the number to a hexadecimal string and pad with leading zeros if necessary
  const randomColor = `#${randomNumber.toString(16).padStart(6, '0')}`;

  return randomColor;
}

export const getPrice = async (priceIds: string[] | undefined, currencyCode: string | undefined) => {
  if (priceIds?.length) {
    const maybePriceInfo = await getPrices(priceIds, currencyCode?.toLowerCase());

    const priceId = Object.keys(maybePriceInfo.prices)[0];

    const price = priceId
      ? maybePriceInfo.prices?.[priceId.toLowerCase()]?.value
      : undefined;

    return price
      ? { price, priceId }
      : undefined;
  }

  return null;
};
