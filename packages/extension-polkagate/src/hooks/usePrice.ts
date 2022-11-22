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

  const savedPrice = useMemo(() =>
    accounts && JSON.parse(accounts.find((acc) => acc.address === address)?.price ?? '{}') as TokenPrice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  , [accounts?.length, address]);

  useEffect(() => {
    if (!chain || !token || !chainName) {
      return;
    }

    getPrice(chain).then((amount) => {
      setNewPrice({ amount, chainName, date: Date.now(), token });
    }).catch(console.error);
  }, [chain, chainName, token]);

  useEffect(() => {
    if (newPrice === undefined || !chainName || !savedPrice) {
      return;
    }

    savedPrice[chainName] = newPrice;

    const metaData = JSON.stringify({ ['price']: JSON.stringify(savedPrice) });

    updateMeta(address, metaData).catch(console.error);
  }, [address, api, chain, chainName, newPrice, savedPrice]);

  useEffect(() => {
    if (!chainName || !savedPrice) {
      return;
    }

    if (savedPrice[chainName]?.date) {
      if (Date.now() - savedPrice[chainName].date < MILLISECONDS_TO_UPDATE) {
        setPrice({ amount: savedPrice[chainName].amount, chainName, token: savedPrice[chainName].token });
      }
    }
  }, [address, chainName, savedPrice]);

  return newPrice ?? price;
}
