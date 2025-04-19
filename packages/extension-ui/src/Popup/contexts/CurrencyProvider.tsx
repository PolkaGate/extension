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
import { EXTRA_PRICE_IDS } from '@polkadot/extension-polkagate/src/util/api/getPrices';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider ({ children }: CurrencyProviderProps) {
  const priceIdsInfo = usePriceIds();

  const [currency, setCurrency] = useState<CurrencyItemType>();
  const isFetchingPricesRef = React.useRef(false);

  useEffect(() => {
    if (priceIdsInfo && currency?.code && !isFetchingPricesRef.current) {
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

          const priceIds = priceIdsInfo.map(({ id }) => id);

          getPrices(priceIds, currency.code.toLowerCase())
            .then((newPrices) => {
              delete (newPrices as Prices).currencyCode;

              priceIdsInfo.forEach(({ genesisHash, id: rawId, symbol }) => {
                const id = EXTRA_PRICE_IDS[rawId] ?? rawId;
                const priceEntry = newPrices.prices[id];

                if (!priceEntry) {
                  return;
                }

                priceEntry.genesisHash = genesisHash;

                if (symbol) {
                  priceEntry.symbol = symbol;
                }
              });

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
  }, [currency?.code, priceIdsInfo]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
