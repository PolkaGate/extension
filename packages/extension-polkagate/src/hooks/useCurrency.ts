// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { CurrencyItemType } from '../popup/homeFullScreen/partials/Currency';

/**
 * @description
 * get the selected currency
 * @returns CurrencyItemType
 */
export default function useCurrency (): CurrencyItemType | undefined {
  const [currency, setCurrency] = useState<CurrencyItemType | undefined>();

  const USD = useMemo(() => ({
    code: 'USD',
    country: 'United States',
    currency: 'Dollar',
    sign: '$'
  }), []);

  useEffect(() => {
    if (currency) {
      return;
    }

    const fetchedPrice = window.localStorage.getItem('currency');
    const parsed = fetchedPrice ? JSON.parse(fetchedPrice) as CurrencyItemType : USD;

    setCurrency(parsed);
  }, [USD, currency]);

  return currency;
}
