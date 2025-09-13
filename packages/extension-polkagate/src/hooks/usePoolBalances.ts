// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Option } from '@polkadot/types';
// @ts-ignore
import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolMember } from '@polkadot/types/lookup';

import { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { FetchingContext } from '../components';
import getPoolAccounts from '../util/getPoolAccounts';
import useChainInfo from './useChainInfo';
import useFormatted from './useFormatted';

export default function usePoolBalances(address: string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>): { balance: BN, genesisHash: string } | null | undefined {
  const { api, chain, chainName } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);
  const isFetching = useContext(FetchingContext);

  const [pooledBalance, setPooledBalance] = useState<{ balance: BN, genesisHash: string } | null>();

  const getPoolBalances = useCallback(() => {
    if (api && !api.query['nominationPools']) {
      return setPooledBalance({ balance: BN_ZERO, genesisHash: api.genesisHash.toString() });
    }

    api && formatted && api.query['nominationPools']['poolMembers'](formatted).then(async (res: any) => {
      const member = res?.unwrapOr(undefined) as PalletNominationPoolsPoolMember | undefined;

      const genesisHash = api.genesisHash.toString();

      if (!member) {
        isFetching.fetching[String(formatted)]['pooledBalance'] = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance({ balance: BN_ZERO, genesisHash }); // user does not joined a pool yet. or pool id does not exist
      }

      const poolId = member.poolId;
      const accounts = poolId && getPoolAccounts(api, poolId);

      if (!accounts) {
        console.warn(`useBalances: can not find a pool with id: ${poolId}`);

        isFetching.fetching[String(formatted)]['pooledBalance'] = false;
        isFetching.set(isFetching.fetching);

        return setPooledBalance({ balance: BN_ZERO, genesisHash });
      }

      const [bondedPool, stashIdAccount, myClaimable = BN_ZERO] = await Promise.all([
        api.query['nominationPools']['bondedPools'](poolId) as unknown as Option<PalletNominationPoolsBondedPoolInner>,
        api.derive.staking.account(accounts.stashId),
        api.call['nominationPoolsApi']?.['pendingRewards']?.(formatted) // not available on paseo hub
      ]);

      const active = member.points.isZero()
        ? BN_ZERO
        : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));

      const unlockingValue = [...member.unbondingEras.values()]
        .reduce((total: BN, value) => total.add(value.toBn()), BN_ZERO);

      genesisHash === chain?.genesisHash && setPooledBalance({ balance: active.add(myClaimable as BN).add(unlockingValue), genesisHash });
      setRefresh?.(false);
      isFetching.fetching[String(formatted)]['pooledBalance'] = false;
      isFetching.set(isFetching.fetching);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, formatted, isFetching.fetching[String(formatted)]?.['length'], setRefresh, chain?.genesisHash]);

  useEffect(() => {
    if (!chain?.genesisHash || !api || !formatted || api.genesisHash.toString() !== chain.genesisHash) {
      return;
    }

    if (!isFetching.fetching[String(formatted)]?.['pooledBalance']) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {};
      }

      isFetching.fetching[String(formatted)]['pooledBalance'] = true;
      isFetching.set(isFetching.fetching);
      getPoolBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, chain?.genesisHash, formatted, getPoolBalances, isFetching.fetching[String(formatted)]?.['length']]);

  useEffect(() => {
    if (refresh) {
      setPooledBalance(undefined);

      if (isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)]['pooledBalance'] = false;
        isFetching.fetching[String(formatted)]['balances'] = true;
      }

      isFetching.set(isFetching.fetching);
      getPoolBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(isFetching?.fetching ?? {})?.length, chainName, formatted, getPoolBalances, refresh]);

  return pooledBalance;
}
