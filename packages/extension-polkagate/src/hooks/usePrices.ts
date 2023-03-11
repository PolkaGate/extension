// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getPrices } from '../util/api/';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { Prices } from '../util/types';

/**
 * @description
 * get all referred chains token prices and save in local storage
 */
export default function usePrices(chainNames: string[] = []): Prices | undefined {
  const [prices, setPrices] = useState<Prices>();
  const [newPrices, setNewPrices] = useState<Prices>();

  useEffect(() => {
    async function fetchPrices() {
      try {
        const prices = await getPrices(chainNames);

        setNewPrices(prices);
      } catch (error) {
        console.error(error);
      }
    }

    if (chainNames.length) {
      fetchPrices();
    }
  }, [chainNames]);

  useEffect(() => {
    if (newPrices) {
      window.localStorage.setItem('prices', JSON.stringify(newPrices));
    }
  }, [newPrices]);

  useEffect(() => {
    const localSavedPrices = window.localStorage.getItem('prices');

    if (localSavedPrices) {
      const parsedPrices = JSON.parse(localSavedPrices) as Prices;

      if (Date.now() - parsedPrices.date < MILLISECONDS_TO_UPDATE) {
        setPrices(parsedPrices);
      }
    }
  }, []);

  return newPrices || prices;
}
