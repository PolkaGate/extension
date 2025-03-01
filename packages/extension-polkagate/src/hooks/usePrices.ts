// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Prices, PricesInCurrencies } from '../util/types';

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';
import { useCurrency } from '.';

/** If we need to retrieve a price, and that price was fetched within the last PRICE_VALIDITY_PERIOD in seconds,
 *  there’s no need to fetch it again; we can simply use the previously saved value.
 * */
export const PRICE_VALIDITY_PERIOD = 2 * 60 * 1000;

export function isPriceUpToDate(lastFetchDate?: number): boolean | undefined {
  return lastFetchDate ? Date.now() - lastFetchDate < PRICE_VALIDITY_PERIOD : undefined;
}

/**
 * @description
 * get all selected chains assets' prices and save in local storage
 * @returns null: means not savedPrice found, happens when the first account is created
 */
export default function usePrices(): Prices | undefined | null {
  const currency = useCurrency();

  const [savedPrice, setSavedPrice] = useState<Prices | null>();
  const [updatedPrice, setUpdatedPrice] = useState<PricesInCurrencies | null>();

  useEffect(() => {
    const unsubscribe = watchStorage('pricesInCurrencies', setUpdatedPrice);

    return () => {
      unsubscribe();
    };
  }, [currency]);

  useEffect(() => {
    if (updatedPrice && currency) {
      const maybeSavedPrices = (updatedPrice)?.[currency.code];

      maybeSavedPrices && setSavedPrice(maybeSavedPrices);
    }
  }, [currency, updatedPrice]);

  useEffect(() => {
    /** Response with the saved and not outdated data if exist */
    currency?.code && getStorage('pricesInCurrencies').then((pricesInCurrencies) => {
      const maybeSavedPrices = (pricesInCurrencies as PricesInCurrencies)?.[currency.code];

      maybeSavedPrices && setSavedPrice(maybeSavedPrices);
    }).catch(console.error);
  }, [currency]);

  return savedPrice;
}
