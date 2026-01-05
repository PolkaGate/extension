// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Prices, PricesInCurrencies } from '@polkadot/extension-polkagate/src/util/types';

import React, { useContext, useEffect, useState } from 'react';

import { CurrencyContext, PricesContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import usePriceIds from '@polkadot/extension-polkagate/src/hooks/usePriceIds';
import { getPrices } from '@polkadot/extension-polkagate/src/util/api';
import { EXTRA_PRICE_IDS } from '@polkadot/extension-polkagate/src/util/api/getPrices';
import { PRICE_VALIDITY_PERIOD, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

interface Props {
  children: React.ReactNode;
}

/** If we need to retrieve a price, and that price was fetched within the last PRICE_VALIDITY_PERIOD in seconds,
 *  there’s no need to fetch it again; we can simply use the previously saved value.
 * */
function isPriceUpToDate (lastFetchDate?: number): boolean | undefined {
  return lastFetchDate ? Date.now() - lastFetchDate < PRICE_VALIDITY_PERIOD : undefined;
}

export default function PricesProvider ({ children }: Props) {
  const priceIdsInfo = usePriceIds();
  const { currency } = useContext(CurrencyContext);

  const [prices, setPrices] = useState<Prices>();
  const isFetchingPricesRef = React.useRef(false);

  useEffect(() => {
    if (priceIdsInfo && currency?.code && !isFetchingPricesRef.current) {
      isFetchingPricesRef.current = true;

      getStorage(STORAGE_KEY.PRICE_IN_CURRENCIES)
        .then((res) => {
          const savedPricesInCurrencies = (res || {}) as PricesInCurrencies;
          const maybeSavedPriceInCurrentCurrencyCode = savedPricesInCurrencies[currency.code];

          if (maybeSavedPriceInCurrentCurrencyCode) {
            setPrices(maybeSavedPriceInCurrentCurrencyCode);

            /** price in the selected currency is already updated hence no need to continue to fetch them again */
            if (isPriceUpToDate(maybeSavedPriceInCurrentCurrencyCode.date)) {
              return;
            }
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

              setPrices(newPrices);
              savedPricesInCurrencies[currency.code] = newPrices;
              setStorage(STORAGE_KEY.PRICE_IN_CURRENCIES, savedPricesInCurrencies)
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
    <PricesContext.Provider value={{ prices, setPrices }}>
      {children}
    </PricesContext.Provider>
  );
}
