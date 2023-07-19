// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { Price, Prices } from '../util/types';
import { useChainName } from '.';

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @returns price : price of the token which the address is already switched to
 */
export default function usePrice(address: string, currency = 'usd'): Price | undefined {
  const [price, setPrice] = useState<Price | undefined>();
  const chainName = useChainName(address)?.toLocaleLowerCase();
  const localSavedPrices = window.localStorage.getItem('prices');

  useEffect(() => {
    if (!chainName || !localSavedPrices) {
      return;
    }
    
    const sanitizeName = chainName.replace('westendassethub', 'westend').replace('kusamaassethub', 'kusama').replace('polkadotassethub', 'polkadot');

    const parsedPrices = JSON.parse(localSavedPrices) as Prices;
    const priceInUsd = parsedPrices?.prices[sanitizeName]?.[currency];

    if (priceInUsd !== undefined && parsedPrices?.date) {
      setPrice({ amount: priceInUsd, chainName, date: parsedPrices.date });
    }
  }, [address, chainName, currency, localSavedPrices]);

  return price;
}
