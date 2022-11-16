// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';
import { updateMeta } from '../messaging';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { TokenPrice } from '../util/types';
import { prepareMetaData } from '../util/utils';
import { useApi, useChain, useFormatted } from '.';

export default function useBalances(address: string): DeriveBalancesAll | undefined {
  const { accounts } = useContext(AccountContext);
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>();
  const [newBalances, setNewBalances] = useState<DeriveBalancesAll | undefined>();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const chainName = chain && chain.name.replace(' Relay Chain', '').toLocaleLowerCase();

  useEffect(() => {
    // isChainApi(chain, api)
    api && formatted && api.derive.balances?.all(formatted).then(setNewBalances).catch(console.error);
  }, [api, formatted]);

  useEffect(() => {
    if (!api || !newBalances) {
      return;
    }

    // const savedBalances = JSON.parse(accounts?.find((acc) => acc.address === address)?.balances ?? '{}') as TokenPrice;

    updateMeta(address,
      prepareMetaData(
        chain,
        'balances',
        {
          balances,
          decimals: api.registry.chainDecimals,
          tokens: api.registry.chainTokens,
          date: Date.now()
        }))
      .catch(console.error);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, api, chain, newBalances]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const savedBalances = JSON.parse(accounts?.find((acc) => acc.address === address)?.balances ?? '{}') as TokenPrice;

    if (savedBalances?.chainName === chainName) {
      const balances = JSON.parse(savedBalances.metadata);

      if (Date.now() - balances.date < MILLISECONDS_TO_UPDATE) {
        setBalances(savedPrice[chainName].price);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, chainName]);

  return newBalances ?? balances;
}
