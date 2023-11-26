// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getPrices } from '../util/api/';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { Prices } from '../util/types';
import useChainNames from './useChainNames';

/**
 * @description
 * get all referred chains token prices and save in local storage
 * @returns null: means not savedPrice found, happens when the first account is created
 */
export default function usePrices(): Prices | undefined | null {
  const chainNames = useChainNames() || [];

  const [savedPrice, setSavedPrice] = useState<Prices | null>();
  const [newPrices, setNewPrices] = useState<Prices>();

  useEffect(() => {
    async function fetchPrices() {
      try {
        const fetchedPrices = await getPrices(chainNames);

        setNewPrices(fetchedPrices);
      } catch (error) {
        console.error(error);
      }
    }

    if (chainNames.length) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPrices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainNames.length]);

  useEffect(() => {
    if (newPrices) {
      chrome.storage.local.set({ prices: newPrices }).catch(console.error);
    }
  }, [newPrices]);

  useEffect(() => {
    chrome.storage.local.get('prices', (res) => {
      const localSavedPrices = res?.prices as Prices;

      if (localSavedPrices) {
        if (Date.now() - localSavedPrices.date < MILLISECONDS_TO_UPDATE) {
          setSavedPrice(localSavedPrices);
        }
      } else {
        setSavedPrice(null);
      }
    });
  }, []);

  return newPrices || savedPrice;
}
