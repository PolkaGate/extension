// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
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

  const [localSavedPrices, setLocalSavedPrices] = useState<Prices>();

  useEffect(() => {
    chrome.storage.local.get('prices', (res) => {
      const localSavedPrices = res?.prices as Prices;

      setLocalSavedPrices(localSavedPrices);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key === 'prices') {
            setLocalSavedPrices(newValue as Prices);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!chainName || !localSavedPrices) {
      return;
    }

    const sanitizeName = chainName.replace('westendassethub', 'westend').replace('kusamaassethub', 'kusama').replace('polkadotassethub', 'polkadot');
    const priceInUsd = localSavedPrices?.prices[sanitizeName]?.[currency];

    if (priceInUsd !== undefined && localSavedPrices?.date) {
      setPrice({
        amount: priceInUsd,
        chainName,
        date: localSavedPrices.date
      });
    }
  }, [address, chainName, currency, localSavedPrices]);

  return price;
}
