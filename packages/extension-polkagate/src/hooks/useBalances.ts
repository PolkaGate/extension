// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { AccountContext } from '../components';
import { updateMeta } from '../messaging';
import { MILLISECONDS_TO_UPDATE } from '../util/constants';
import { BalancesAll, SavedBalances } from '../util/types';
import { useApi, useChain, useFormatted } from '.';

export default function useBalances(address: string, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean | undefined>>
): BalancesAll | undefined {
  const { accounts } = useContext(AccountContext);
  const [balances, setBalances] = useState<BalancesAll | undefined>();
  const [newBalances, setNewBalances] = useState<BalancesAll | undefined>();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const chainName = chain && chain.name.replace(' Relay Chain', '').toLocaleLowerCase();
  const token = api && api.registry.chainTokens[0];
  const decimal = api && api.registry.chainDecimals[0];

  const getBalances = useCallback(() => {
    if (!token || !decimal || !chainName) {
      return;
    }

    api && formatted && api.derive.balances?.all(formatted).then((b) => {
      b['token'] = token;
      b['decimal'] = decimal;
      b['chainName'] = chainName;

      setNewBalances(b);
      setRefresh && setRefresh(false);
    }).catch(console.error);
  }, [api, chainName, decimal, formatted, setRefresh, token]);

  useEffect(() => {
    getBalances();
  }, [api, chainName, decimal, formatted, getBalances, token]);

  useEffect(() => {
    if (refresh) {
      setBalances(undefined);
      setNewBalances(undefined);
      getBalances();
    }
  }, [api, chainName, decimal, formatted, getBalances, refresh, token]);

  useEffect(() => {
    if (!api || !newBalances || !chainName || !token || !decimal) {
      return;
    }

    const savedBalances = JSON.parse(accounts?.find((acc) => acc.address === address)?.balances ?? '{}') as SavedBalances;

    const balances = {
      availableBalance: newBalances.availableBalance.toString(),
      freeBalance: newBalances.freeBalance.toString(),
      frozenFee: newBalances.frozenFee.toString(),
      frozenMisc: newBalances.frozenMisc.toString(),
      lockedBalance: newBalances.lockedBalance.toString(),
      reservedBalance: newBalances.reservedBalance.toString(),
      vestedBalance: newBalances.vestedBalance.toString(),
      vestedClaimable: newBalances.vestedClaimable.toString(),
      votingBalance: newBalances.votingBalance.toString()
    };

    savedBalances[chainName] = { balances, date: Date.now(), decimal, token };
    const metaData = JSON.stringify({ ['balances']: JSON.stringify(savedBalances) });

    updateMeta(address, metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, api, chain, chainName, newBalances]);

  useEffect(() => {
    if (!chainName || !accounts) {
      return;
    }

    const savedBalances = JSON.parse(accounts.find((acc) => acc.address === address)?.balances ?? '{}') as SavedBalances;

    if (savedBalances[chainName]) {
      const sb = savedBalances[chainName].balances;

      // if (Date.now() - sb.date < MILLISECONDS_TO_UPDATE) {
      const lastBalances = {
        availableBalance: new BN(sb.availableBalance),
        chainName,
        decimal: savedBalances[chainName].decimal,
        freeBalance: new BN(sb.freeBalance),
        frozenFee: new BN(sb.frozenFee),
        frozenMisc: new BN(sb.frozenMisc),
        lockedBalance: new BN(sb.lockedBalance),
        reservedBalance: new BN(sb.reservedBalance),
        token: savedBalances[chainName].token,
        vestedBalance: new BN(sb.vestedBalance),
        vestedClaimable: new BN(sb.vestedClaimable),
        votingBalance: new BN(sb.votingBalance)
      };

      setBalances(lastBalances);
    }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, address, chainName]);

  return newBalances ?? balances;
}
