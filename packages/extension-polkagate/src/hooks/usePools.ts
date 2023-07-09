// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { Codec } from '@polkadot/types/types';
import type { PoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import getPoolAccounts from '../util/getPoolAccounts';
import { useApi } from '.';

const handleInfo = (info: [Codec, Codec, Codec, DeriveStakingAccount][], lastBatchLength: number) =>
  info.map((i, index) => {
    if (i[1].isSome) {
      const bondedPool = i[1].unwrap();

      return {
        bondedPool,
        metadata: i[0]?.length
          ? i[0]?.isUtf8
            ? i[0]?.toUtf8()
            : i[0]?.toString()
          : null,
        poolId: index + lastBatchLength + 1, // works because pools id is not reuseable for now
        rewardPool: i[2]?.isSome ? i[2].unwrap() : null,
        stashIdAccount: i[3]
      };
    } else {
      return undefined;
    }
  })?.filter((f) => f !== undefined);

export default function usePools(address: string): PoolInfo[] | null | undefined {
  const [pools, setPools] = useState<PoolInfo[] | undefined | null>();
  const api = useApi(address);

  const getPools = useCallback(async (api: ApiPromise) => {
    const lastPoolId = ((await api.query.nominationPools.lastPoolId())?.toNumber() || 0) as number;

    console.log(`getPools: Getting ${lastPoolId} pools information.`);

    window.dispatchEvent(new CustomEvent('totalNumberOfPools', { detail: lastPoolId }));

    if (!lastPoolId) {
      setPools(null);
    }

    let poolsInfo: PoolInfo[] = [];
    let upperBond;
    const page = 50;
    let totalFetched = 0;

    while (lastPoolId > totalFetched) {
      console.log(`Fetching pools info : ${totalFetched}/${lastPoolId}`);
      const queries = [];

      upperBond = totalFetched + page < lastPoolId ? totalFetched + page : lastPoolId;

      for (let poolId = totalFetched + 1; poolId <= upperBond; poolId++) {
        const { stashId } = getPoolAccounts(api, poolId);

        queries.push(Promise.all([
          api.query.nominationPools.metadata(poolId),
          api.query.nominationPools.bondedPools(poolId),
          api.query.nominationPools.rewardPools(poolId),
          api.derive.staking.account(stashId)
        ]));
      }

      const i = await Promise.all(queries);

      const info = handleInfo(i, totalFetched);

      poolsInfo = poolsInfo.concat(info);
      totalFetched += page;
      window.dispatchEvent(new CustomEvent('numberOfFetchedPools', { detail: upperBond }));
      window.dispatchEvent(new CustomEvent('incrementalPools', { detail: poolsInfo }));
    }

    console.log('getting pools owners identities...');
    const identities = await Promise.all(poolsInfo.map((pool) => api.derive.accounts.info(pool.bondedPool.roles?.root || pool.bondedPool.roles.depositor)));

    poolsInfo = poolsInfo.map((p, index) => {
      p.identity = identities[index].identity;

      return p;
    });

    console.log(`${identities?.length} identities of pool owners are fetched`);

    setPools(poolsInfo);
  }, []);

  useEffect(() => {
    api && getPools(api);
  }, [api, getPools]);

  return pools;
}
