// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getPrices } from '../util/api/';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { Prices } from '../util/types';

/** 
 * @description
 * get all referred chains toke prices and save in local storage
 */
export default function usePrices (chainNames: string[] | undefined): Prices | undefined {
  const [prices, setPrices] = useState<Prices | undefined>();
  const [newPrices, setNewPrices] = useState<Prices | undefined>();

  useEffect(() => {
    if (!chainNames?.length) {
      return;
    }

    getPrices(chainNames).then((prices) => {
      setNewPrices(prices);
    }).catch(console.error);
  }, [chainNames]);

  useEffect(() => {
    if (newPrices === undefined) {
      return;
    }

    window.localStorage.setItem('prices', JSON.stringify(newPrices));
  }, [chainNames, newPrices]);

  useEffect(() => {
    const localSavedPrices = window.localStorage.getItem('price');

    if (localSavedPrices) {
      const parsedPrices = JSON.parse(localSavedPrices) as Prices;

      if ((Date.now() - parsedPrices.date) < MILLISECONDS_TO_UPDATE) {
        setPrices(parsedPrices);
      }
    }
  }, []);

  return newPrices ?? prices;
}
