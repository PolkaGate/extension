// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletNominationPoolsPoolMember } from '@polkadot/types/lookup';

import { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { FetchingContext } from '../components';
import { updateMeta } from '../messaging';
import getPoolAccounts from '../util/getPoolAccounts';
import { BalancesInfo, SavedBalances } from '../util/types';
import { useAccount, useApi, useChain, useChainName, useDecimal, useFormatted, useToken } from '.';

export default function useBalances(address: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>): BalancesInfo | undefined {
  const account = useAccount(address);
  const [pooledBalance, setPooledBalance] = useState<{ balance: BN, genesisHash: string } | null>();
  const [balances, setBalances] = useState<BalancesInfo | undefined>();
  const [overall, setOverall] = useState<BalancesInfo | undefined>();
  const [newBalances, setNewBalances] = useState<BalancesInfo | undefined>();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const isFetching = useContext(FetchingContext);
  const chainName = useChainName(address);
  const currentToken = useToken(address);
  const currentDecimal = useDecimal(address);
  const token = api && api.registry.chainTokens[0];
  const decimal = api && api.registry.chainDecimals[0];

  const getPoolBalances = useCallback(() => {
    if (api && !api.query.nominationPools) {
      return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() });
    }

    api && formatted && api.query.nominationPools.poolMembers(formatted).then(async (res) => {
      const member = res?.unwrapOr(undefined) as PalletNominationPoolsPoolMember | undefined;

      if (!member) {
        console.log(`useBalances: can not find member for ${formatted}`);

        isFetching.fetching[String(formatted)].pooledBalance = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() }); // user does not joined a pool yet. or pool id does not exist
      }

      const poolId = member.poolId;
      const accounts = poolId && getPoolAccounts(api, poolId);

      if (!accounts) {
        console.log(`useBalances: can not find a pool with id: ${poolId}`);

        isFetching.fetching[String(formatted)].pooledBalance = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() });
      }

      const [bondedPool, stashIdAccount, myClaimable] = await Promise.all([
        api.query.nominationPools.bondedPools(poolId),
        api.derive.staking.account(accounts.stashId),
        api.call.nominationPoolsApi.pendingRewards(formatted)
      ]);

      const active = member.points.isZero()
        ? BN_ZERO
        : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));
      const rewards = myClaimable as Balance;
      let unlockingValue = BN_ZERO;

      member?.unbondingEras?.forEach((value) => {
        unlockingValue = unlockingValue.add(value);
      });

      api.genesisHash.toString() === chain?.genesisHash && setPooledBalance({ balance: active.add(rewards).add(unlockingValue), genesisHash: api.genesisHash.toString() });
      setRefresh && setRefresh(false);
      isFetching.fetching[String(formatted)].pooledBalance = false;
      isFetching.set(isFetching.fetching);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, formatted, isFetching.fetching[String(formatted)]?.length, setRefresh]);

  const getBalances = useCallback(() => {
    if (!chainName || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return;
    }

    api && formatted && api.derive.balances?.all(formatted).then((b) => {
      setNewBalances({ ...b, chainName, genesisHash: api.genesisHash.toString(), date: Date.now(), decimal, token });
      setRefresh && setRefresh(false);
      isFetching.fetching[String(formatted)].balances = false;
      isFetching.set(isFetching.fetching);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, chainName, formatted, isFetching.fetching[String(formatted)]?.length, setRefresh]);

  useEffect(() => {
    if (newBalances && pooledBalance && api?.genesisHash?.toString() === chain?.genesisHash && api?.genesisHash?.toString() === newBalances?.genesisHash && api?.genesisHash?.toString() === pooledBalance.genesisHash) {
      setOverall({
        ...newBalances,
        pooledBalance: pooledBalance.balance
      });
    } else {
      setOverall(undefined);
    }
  }, [pooledBalance, newBalances, api?.genesisHash, account?.genesisHash, chain?.genesisHash]);

  useEffect(() => {
    if (!formatted || !token || !decimal || !chainName || api?.genesisHash?.toString() !== chain?.genesisHash) {
      return;
    }

    /** to fetch a formatted address's balance if not already fetching */
    if (!isFetching.fetching[String(formatted)]?.balances) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {};
      }

      isFetching.fetching[String(formatted)].balances = true;
      isFetching.set(isFetching.fetching);
      getBalances();
    } else {
      console.log(`Balance is fetching for ${formatted}, hence doesn't need to fetch it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, chainName, decimal, formatted, getBalances, isFetching.fetching[String(formatted)]?.length, token]);

  useEffect(() => {
    if (!chain?.genesisHash || !api || !formatted || api.genesisHash.toString() !== chain.genesisHash) {
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
      console.log('pooled balance is fetching not need to fetch it again!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, formatted, getPoolBalances, isFetching.fetching[String(formatted)]?.length]);

  useEffect(() => {
    if (refresh) {
      setBalances(undefined);
      setNewBalances(undefined);
      setPooledBalance(undefined);

      if (isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)].pooledBalance = false;
        isFetching.fetching[String(formatted)].balances = true;
      }

      isFetching.set(isFetching.fetching);
      getBalances();
      getPoolBalances();
    }
  }, [Object.keys(isFetching?.fetching ?? {})?.length, api, chainName, decimal, formatted, getBalances, getPoolBalances, refresh, token]);

  useEffect(() => {
    if (!address || !api || api.genesisHash.toString() !== account?.genesisHash || !overall || !chainName || !token || !decimal || account?.genesisHash !== chain?.genesisHash) {
      return;
    }

    /** to save fetched balance in local storage, first load saved balances of different chaines if any */
    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    const balances = {
      availableBalance: overall.availableBalance.toString(),
      freeBalance: overall.freeBalance.toString(),
      // frozenFee: overall.frozenFee.toString(),
      // frozenMisc: overall.frozenMisc.toString(),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, account?.genesisHash, address, api, pooledBalance, chain, chainName, decimal, overall, token]);

  useEffect(() => {
    if (!chainName || !account || account?.genesisHash !== chain?.genesisHash) {
      return;
    }

    const savedBalances = JSON.parse(account?.balances ?? '{}') as SavedBalances;

    if (savedBalances[chainName]) {
      const sb = savedBalances[chainName].balances;

      const lastBalances = {
        availableBalance: new BN(sb.availableBalance),
        chainName,
        date: savedBalances[chainName].date,
        decimal: savedBalances[chainName].decimal,
        freeBalance: new BN(sb.freeBalance),
        // frozenFee: new BN(sb.frozenFee),
        // frozenMisc: new BN(sb.frozenMisc),
        lockedBalance: new BN(sb.lockedBalance),
        pooledBalance: new BN(sb.pooledBalance),
        reservedBalance: new BN(sb.reservedBalance),
        token: savedBalances[chainName].token,
        vestedBalance: new BN(sb.vestedBalance),
        vestedClaimable: new BN(sb.vestedClaimable),
        votingBalance: new BN(sb.votingBalance)
      };

      setBalances(lastBalances);

      return;
    }

    setBalances(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, address, chainName]);

  // return overall && overall.genesisHash === chain?.genesisHash ? overall : balances;
  return overall && overall.genesisHash === chain?.genesisHash && overall.token === currentToken && overall.decimal === currentDecimal
    ? overall
    : balances && balances.token === currentToken && balances.decimal === currentDecimal
      ? balances
      : undefined;
}
