// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect } from 'react';

import { CurrencyContext } from '../components';
import { getStorage, watchStorage } from '../components/Loading';
import { CurrencyItemType } from '../popup/homeFullScreen/partials/Currency';
import { USD_CURRENCY } from '../util/constants';

/**
 * @description
 * get the selected currency
 * @returns CurrencyItemType
 */
export default function useCurrency (): CurrencyItemType | undefined {
  const { currency, setCurrency } = useContext(CurrencyContext);

  useEffect(() => {
    getStorage('currency').then((res) => {
      setCurrency(res as CurrencyItemType || USD_CURRENCY);
    }).catch(console.error);

    watchStorage('currency', setCurrency).catch(console.error);
  }, [setCurrency]);

  return currency;
}
