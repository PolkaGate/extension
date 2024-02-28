// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CurrencyContext } from '../components';
import { CurrencyItemType } from '../popup/homeFullScreen/partials/Currency';

/**
 * @description
 * get the selected currency
 * @returns CurrencyItemType
 */
export default function useCurrency (): CurrencyItemType | undefined {
  const { currency, setCurrency } = useContext(CurrencyContext);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItemType | undefined>();

  const USD = useMemo(() => ({
    code: 'USD',
    country: 'United States',
    currency: 'Dollar',
    sign: '$'
  }), []);

  const fetchSavedCurrency = useCallback(() => {
    const fetchedPrice = window.localStorage.getItem('currency');
    const parsed = fetchedPrice ? JSON.parse(fetchedPrice) as CurrencyItemType : USD;

    setSelectedCurrency(parsed);
    setCurrency(parsed);
  }, [USD, setCurrency]);

  useEffect(() => {
    if (!selectedCurrency && currency) {
      setSelectedCurrency(currency);
    } else if (currency && selectedCurrency?.code !== currency.code) {
      setSelectedCurrency(currency);
    } else if (!selectedCurrency && !currency) {
      fetchSavedCurrency();
    }
  }, [currency, fetchSavedCurrency, selectedCurrency]);

  return selectedCurrency;
}
