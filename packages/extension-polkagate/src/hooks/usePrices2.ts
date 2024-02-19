// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { getPrices2 } from '../util/api';
import { OutputPrices } from '../util/types';
import { useCurrency } from '.';

/**
 * @description Version 2 of he hook usePrices
 * get all DEFAULT_ASSETS prices and save in local storage
 * @returns null: means not savedPrice found, happens when the first account is created
 */
export default function usePrices2 (): OutputPrices | undefined | null {
  const currency = useCurrency();
  const priceIds = useMemo(() => ['polkadot', 'kusama', 'acala', 'astar', 'hydradx', 'karura', 'liquid-staking-dot', 'acala-dollar-acala', 'tether', 'usd-coin'], []);

  const [savedPrice, setSavedPrice] = useState<OutputPrices | null>();
  const [newPrices, setNewPrices] = useState<OutputPrices | null>();
  const [outDated, setOutDated] = useState<boolean>(false);

  useEffect(() => {
    if (!currency || newPrices || (savedPrice && !outDated)) {
      return;
    }

    async function fetchPrices () {
      try {
        const fetchedPrices = await getPrices2(priceIds, currency?.code.toLocaleLowerCase());

        setNewPrices(fetchedPrices);
      } catch (error) {
        console.error(error);
      }
    }

    // eslint-disable-next-line no-void
    void fetchPrices();
  }, [currency, newPrices, outDated, priceIds, savedPrice]);

  useEffect(() => {
    if (newPrices) {
      chrome.storage.local.set({ prices2: newPrices }).catch(console.error);
    }
  }, [newPrices]);

  useEffect(() => {
    chrome.storage.local.get('prices2', (res) => {
      const localSavedPrices = res?.prices2 as OutputPrices;

      if (localSavedPrices) {
        setOutDated((localSavedPrices.date - Date.now()) > 1000 * 60);
        setSavedPrice(localSavedPrices);
      } else {
        setSavedPrice(null);
      }
    });
  }, []);

  return newPrices || savedPrice;
}
