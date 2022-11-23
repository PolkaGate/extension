// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext } from '../components';
import { updateMeta } from '../messaging';
import { getPrice } from '../util/api/getPrice';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { Price, TokenPrice } from '../util/types';
import { useApi, useChain } from '.';

export default function usePrice(address: string): Price | undefined {
  const { accounts } = useContext(AccountContext);
  const [price, setPrice] = useState<Price | undefined>();
  const [newPrice, setNewPrice] = useState<Price | undefined>();
  const api = useApi(address);
  const chain = useChain(address);
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');
  const token = api && api.registry.chainTokens[0];

  useEffect(() => {
    if (!chain || !token || !chainName) {
      return;
    }

    getPrice(chain).then((amount) => {
      setNewPrice({ amount, chainName, date: Date.now(), token });
    }).catch(console.error);
  }, [chain, chainName, token]);

  useEffect(() => {
    if (newPrice === undefined || !chainName) {
      return;
    }

    window.localStorage.setItem(`${chainName}_price`, JSON.stringify(newPrice));

    // updateMeta(address, metaData).catch(console.error);
  }, [address, api, chain, chainName, newPrice]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedPrice = window.localStorage.getItem(`${chainName}_price`);

    if (localSavedPrice) {
      const parsedPrice = JSON.parse(localSavedPrice) as Price;

      if ((Date.now() - parsedPrice.date) < MILLISECONDS_TO_UPDATE) {
        setPrice({ amount: parsedPrice.amount, chainName, token: parsedPrice.token });
      }
    }
  }, [address, chainName]);

  return newPrice ?? price;
}
