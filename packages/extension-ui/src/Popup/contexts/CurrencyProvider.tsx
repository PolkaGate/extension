// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CurrencyItemType } from '@polkadot/extension-polkagate/src/fullscreen/homeFullScreen/partials/Currency';
import type { Prices, PricesInCurrencies } from '@polkadot/extension-polkagate/src/util/types';

import React, { useEffect, useState } from 'react';

import { CurrencyContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import usePriceIds from '@polkadot/extension-polkagate/src/hooks/usePriceIds';
import { isPriceUpToDate } from '@polkadot/extension-polkagate/src/hooks/usePrices';
import { getPrices } from '@polkadot/extension-polkagate/src/util/api';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider({ children }: CurrencyProviderProps) {
  const priceIds = usePriceIds();

  const [currency, setCurrency] = useState<CurrencyItemType>();
  const isFetchingPricesRef = React.useRef(false);

  useEffect(() => {
    if (priceIds && currency?.code && !isFetchingPricesRef.current) {
      isFetchingPricesRef.current = true;

      getStorage('pricesInCurrencies')
        .then((res) => {
          const savedPricesInCurrencies = (res || {}) as PricesInCurrencies;
          const maybeSavedPriceInCurrentCurrencyCode = savedPricesInCurrencies[currency.code];

          if (maybeSavedPriceInCurrentCurrencyCode && isPriceUpToDate(maybeSavedPriceInCurrentCurrencyCode.date)) {
            /** price in the selected currency is already updated hence no need to fetch again */
            // TODO: FixMe: what if users change selected chainS during price validity period?
            return;
          }

          getPrices(priceIds, currency.code.toLowerCase())
            .then((newPrices) => {
              delete (newPrices as Prices).currencyCode;
              savedPricesInCurrencies[currency.code] = newPrices;
              setStorage('pricesInCurrencies', savedPricesInCurrencies)
                .catch(console.error);
            })
            .catch(console.error);
        })
        .catch(console.error)
        .finally(() => {
          isFetchingPricesRef.current = false;
        });
    }
  }, [currency?.code, priceIds]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
