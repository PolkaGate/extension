// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { Price, Prices } from '../util/types';
import { useChain } from '.';

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @returns price : price of the token which the address is already switched to
 */
export default function usePrice(address: string): Price | undefined {
  const [price, setPrice] = useState<Price | undefined>();
  const chain = useChain(address);
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '')?.toLowerCase();

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedPrices = window.localStorage.getItem('prices');

    if (localSavedPrices) {
      const parsedPrices = JSON.parse(localSavedPrices) as Prices;
      const priceInUsd = parsedPrices?.prices[chainName]?.usd;

      if (priceInUsd !== undefined) {
        setPrice({ amount: priceInUsd, chainName });
      }
    }
  }, [address, chainName]);

  return price;
}
