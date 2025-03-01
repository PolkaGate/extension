// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CurrencyItemType } from '../fullscreen/homeFullScreen/partials/Currency';

import { useContext, useEffect } from 'react';

import { CurrencyContext } from '../components';
import { getStorage, watchStorage } from '../components/Loading';
import { USD_CURRENCY } from '../util/currencyList';

/**
 * @description
 * get the selected currency
 * @returns CurrencyItemType
 */
export default function useCurrency(): CurrencyItemType | undefined {
  const { currency, setCurrency } = useContext(CurrencyContext);

  useEffect(() => {
    getStorage('currency').then((res) => {
      setCurrency(res as CurrencyItemType || USD_CURRENCY);
    }).catch(console.error);

    const unsubscribe = watchStorage('currency', setCurrency);

    return () => {
      unsubscribe();
    };
  }, [setCurrency]);

  return currency;
}
