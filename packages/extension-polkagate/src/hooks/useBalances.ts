// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { FetchingContext } from '../components';
import { updateMeta } from '../messaging';
import getPoolAccounts from '../util/getPoolAccounts';
import { BalancesInfo, SavedBalances } from '../util/types';
import { useAccount, useApi, useChain, useFormatted } from '.';

interface Output {
  balance: BN;
  token: string;
}

export default function useBalances(address: string, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean | undefined>>
): BalancesInfo | undefined {
  const account = useAccount(address);
  const [pooledBalance, setPooledBalance] = useState<BN | null>();
  const [balances, setBalances] = useState<BalancesInfo | undefined>();
  const [overall, setOverall] = useState<BalancesInfo | undefined>();
  const [newBalances, setNewBalances] = useState<BalancesInfo | undefined>();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const isFetching = useContext(FetchingContext);

  // console.log('isFetching.fetching:', isFetching.fetching);

  const chainName = chain && chain.name.replace(' Relay Chain', '')?.replace(' Network', '').toLocaleLowerCase();
  const token = api && api.registry.chainTokens[0];
  const decimal = api && api.registry.chainDecimals[0];

  const getPoolBalances = useCallback(() => {
    if (api && !api.query.nominationPools) {
      return setPooledBalance(BN_ZERO);
    }

    api && formatted && api.query.nominationPools.poolMembers(formatted).then(async (res) => {
      const member = res.unwrapOr(undefined);

      if (!member) {
        console.log(`can not find member for ${formatted}`);

        isFetching.fetching[String(formatted)].pooledBalance = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance(BN_ZERO); // user does not joined a pool yet. or pool id does not exist
      }

      const poolId = member?.poolId?.toNumber();
      const accounts = poolId && getPoolAccounts(api, poolId);

      if (!accounts) {
        console.log(`can not find a pool with id:${poolId}`);

        isFetching.fetching[String(formatted)].pooledBalance = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance(BN_ZERO);
      }

      const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
        api.query.nominationPools.bondedPools(poolId),
        api.derive.staking.account(accounts.stashId),
        api.call.nominationPoolsApi.pendingRewards(formatted)
      ]);

      const active = member.points.isZero() ? BN_ZERO : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));
      const rewards = new BN(myClaimable);
      let unlockingValue = BN_ZERO;

      const parsedUnbondingEras = JSON.parse(JSON.stringify(member?.unbondingEras));

      if (parsedUnbondingEras?.length) {
        for (const [_, unbondingPoint] of Object.entries(parsedUnbondingEras)) {
          unlockingValue = unlockingValue.add(new BN(String(unbondingPoint)));
        }
      }

      setPooledBalance(active.add(rewards).add(unlockingValue));
      setRefresh && setRefresh(false);
      // isFetching.fetching[String(formatted)].pooledBalance = false;
      // isFetching.set(isFetching.fetching);
    }).catch(console.error);
  }, [api, formatted, isFetching.fetching[String(formatted)]?.length, setRefresh]);

  const getBalances = useCallback(() => {
    if (!token || !decimal || !chainName || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return;
    }

    api && formatted && api.derive.balances?.all(formatted).then((b) => {
      b['token'] = token;
      b['decimal'] = decimal;
      b['chainName'] = chainName;

      setNewBalances(b);
      setRefresh && setRefresh(false);
      // isFetching.fetching[String(formatted)].balances = false;
      // isFetching.set(isFetching.fetching);
    }).catch(console.error);
  }, [api, chain?.genesisHash, chainName, decimal, formatted, isFetching.fetching[String(formatted)]?.length, setRefresh, token]);

  useEffect(() => {
    if (newBalances && pooledBalance) {
      setOverall({
        ...newBalances,
        pooledBalance
      });
    }
  }, [pooledBalance, newBalances]);

  useEffect(() => {
    if (!token || !decimal || !chainName || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return;
    }

    if (!isFetching.fetching[String(formatted)]?.balances) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {};
      }

      isFetching.fetching[String(formatted)].balances = true;
      isFetching.set(isFetching.fetching);
      getBalances();
    } else {
      console.log('Balances is fetching not needs to fetch it again!');
    }
  }, [api, chain?.genesisHash, chainName, decimal, formatted, getBalances, isFetching.fetching[String(formatted)]?.length, token]);

  useEffect(() => {
    if (!chain?.genesisHash || !api || !formatted || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return;
    }

    if (!isFetching.fetching[String(formatted)]?.pooledBalance) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {};
      }

      isFetching.fetching[String(formatted)].pooledBalance = true;
      isFetching.set(isFetching.fetching);
      getPoolBalances();
    } else {
      console.log('pooled balance is fetching not needs to fetch it again!');
    }
  }, [api, chain?.genesisHash, formatted, getPoolBalances, isFetching.fetching[String(formatted)]?.length]);

  useEffect(() => {
    if (refresh) {
      setBalances(undefined);
      setNewBalances(undefined);
      setPooledBalance(undefined);
      getBalances();
      getPoolBalances();
    }
  }, [api, chainName, decimal, formatted, getBalances, getPoolBalances, refresh, token]);

  useEffect(() => {
    if (!api || !overall || !chainName || !token || !decimal || account?.genesisHash !== chain?.genesisHash) {
      return;
    }

    // load save balances of different chaines
    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    const balances = {
      availableBalance: overall.availableBalance.toString(),
      date: Date.now(),
      freeBalance: overall.freeBalance.toString(),
      frozenFee: overall.frozenFee.toString(),
      frozenMisc: overall.frozenMisc.toString(),
      lockedBalance: overall.lockedBalance.toString(),
      pooledBalance: overall.pooledBalance.toString(),
      reservedBalance: overall.reservedBalance.toString(),
      vestedBalance: overall.vestedBalance.toString(),
      vestedClaimable: overall.vestedClaimable.toString(),
      votingBalance: overall.votingBalance.toString()
    };

    // add this chain balances
    savedBalances[chainName] = { balances, date: Date.now(), decimal, token };
    const metaData = JSON.stringify({ ['balances']: JSON.stringify(savedBalances) });

    updateMeta(address, metaData).catch(console.error);
  }, [Object.keys(account ?? {})?.length, account?.genesisHash, address, api, pooledBalance, chain, chainName, decimal, overall, token]);

  useEffect(() => {
    if (!chainName || !account || account?.genesisHash !== chain?.genesisHash) {
      return;
    }

    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    if (savedBalances[chainName]) {
      const sb = savedBalances[chainName].balances;

      // if (Date.now() - sb.date < MILLISECONDS_TO_UPDATE) {
      const lastBalances = {
        availableBalance: new BN(sb.availableBalance),
        chainName,
        date: sb.date,
        decimal: savedBalances[chainName].decimal,
        freeBalance: new BN(sb.freeBalance),
        frozenFee: new BN(sb.frozenFee),
        frozenMisc: new BN(sb.frozenMisc),
        lockedBalance: new BN(sb.lockedBalance),
        pooledBalance: new BN(sb.pooledBalance),
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
  }, [Object.keys(account ?? {})?.length, address, chainName]);

  return overall ?? balances;
}
