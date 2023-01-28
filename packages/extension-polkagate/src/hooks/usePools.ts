// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import getPoolAccounts from '../util/getPoolAccounts';
import { useApi, useEndpoint2 } from '.';

export default function usePools(address: string): PoolInfo[] | null | undefined {
  const [pools, setPools] = useState<PoolInfo[] | undefined | null>();
  const api = useApi(address);

  const getPools = useCallback(async (api: ApiPromise) => {
    const lastPoolId = await api.query.nominationPools.lastPoolId();

    console.log(`getPools: Getting ${lastPoolId.toNumber()} pools information.`);

    window.dispatchEvent(new CustomEvent('totalNumberOfPools', { detail: lastPoolId.toNumber() }));

    if (!lastPoolId) {
      setPools(null);
    }

    let info = [];
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

      info = info.concat(i);
      totalFetched += page;
      window.dispatchEvent(new CustomEvent('numberOfFetchedPools', { detail: upperBond }));
    }

    let poolsInfo = info.map((i, index) => {
      if (i[1].isSome) {
        const bondedPool = i[1].unwrap();

        return {
          bondedPool,
          metadata: i[0]?.length
            ? i[0]?.isUtf8
              ? i[0]?.toUtf8()
              : i[0]?.toString()
            : null,
          poolId: index + 1, // works because pools id is not reuseable for now
          rewardPool: i[2]?.isSome ? i[2].unwrap() : null,
          stashIdAccount: i[3]
        };
      } else {
        return undefined;
      }
    })?.filter((f) => f !== undefined);

    console.log('getting pools owners identities...');
    const identities = await Promise.all(poolsInfo.map((pool) => api.derive.accounts.info(pool.bondedPool.roles?.root || pool.bondedPool.roles.depositor)));

    poolsInfo = poolsInfo.map((p, index) => {
      p.identity = identities[index].identity;

      return p;
    });

    console.log(`${identities?.length} identities of pool owners are fetched`);

    setPools(poolsInfo);
  }, []);

  // const getPools = useCallback((endpoint: string) => {
  //   const getPoolsWorker: Worker = new Worker(new URL('../util/workers/getPools.js', import.meta.url));

  //   getPoolsWorker.postMessage({ endpoint });

  //   getPoolsWorker.onerror = (err) => {
  //     console.log(err);
  //   };

  //   getPoolsWorker.onmessage = (e: MessageEvent<any>) => {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //     const poolsInfo: string = e.data;

  //     if (!poolsInfo) {
  //       setPools(null);// noo pools found, probably never happens

  //       return;
  //     }

  //     const parsedPoolsInfo = JSON.parse(poolsInfo);

  //     const info = parsedPoolsInfo.info as PoolInfo[];

  //     info?.forEach((p: PoolInfo) => {
  //       if (p?.bondedPool?.points) {
  //         p.bondedPool.points = new BN(String(p.bondedPool.points));
  //       }

  //       p.poolId = new BN(p.poolId);
  //     });

  //     setPools(info);
  //     getPoolsWorker.terminate();
  //   };
  // }, []);

  useEffect(() => {
    api && getPools(api);
  }, [api, getPools]);

  return pools;
}
