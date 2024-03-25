// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { EXTRA_PRICE_IDS } from '../util/api/getPrices';
import { Price } from '../util/types';
import { useChainName, usePrices } from '.';

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @returns price : price of the token which the address is already switched to
 */
export default function useTokenPrice (address: string, currency = 'usd'): Price | undefined {
  const chainName = useChainName(address)?.toLocaleLowerCase();

  const pricesInCurrencies = usePrices();

  return useMemo(() => {
    if (!chainName) {
      return;
    }

    const mayBePriceValue = pricesInCurrencies?.prices?.[EXTRA_PRICE_IDS[chainName] || chainName]?.value;

    if (mayBePriceValue) {
      return {
        chainName,
        date: pricesInCurrencies.date,
        value: mayBePriceValue
      };
    }

    return undefined;
  }, [chainName, pricesInCurrencies]);
}
