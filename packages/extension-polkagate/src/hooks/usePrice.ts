// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';
import { updateMeta } from '../messaging';
import { getPrice } from '../util/api/getPrice';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { TokenPrice } from '../util/types';
import { useApi, useChain } from '.';

export default function usePrice(address: string): number | undefined {
  const { accounts } = useContext(AccountContext);
  const [price, setPrice] = useState<number | undefined>();
  const [newPrice, setNewPrice] = useState<number | undefined>();
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = chain && chain.name.replace(' Relay Chain', '').toLocaleLowerCase();

  useEffect(() => {
    if (!chain) {
      return;
    }

    getPrice(chain).then((p) => {
      setNewPrice(p);
      console.log('tadaaaaaaaaaaaaaaaaaaaaaaa');
    }).catch(console.error);
  }, [chain]);

  useEffect(() => {
    if (newPrice === undefined || !chainName) {
      return;
    }

    const savedPrice = JSON.parse(accounts?.find((acc) => acc.address === address)?.price ?? '{}') as TokenPrice;

    savedPrice[chainName] = { date: Date.now(), price: newPrice };

    const metaData = JSON.stringify({ ['price']: JSON.stringify(savedPrice) });

    updateMeta(address, metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, api, chain, newPrice]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const savedPrice = JSON.parse(accounts?.find((acc) => acc.address === address)?.price ?? '{}') as TokenPrice;

    if (savedPrice[chainName]?.price) {
      if (Date.now() - savedPrice[chainName]?.date < MILLISECONDS_TO_UPDATE) {
        setPrice(savedPrice[chainName].price);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, chainName]);

  return newPrice ?? price;
}
