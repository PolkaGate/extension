// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { ApiPromise } from '@polkadot/api';
import type { DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { Codec } from '@polkadot/types/types';
import type { PoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

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

interface UsePools {
  incrementalPools: PoolInfo[] | null | undefined;
  numberOfFetchedPools: number;
  totalNumberOfPools: number | undefined;
}

export default function usePools(address: string): UsePools {
  const api = useApi(address);

  const [totalNumberOfPools, setTotalNumberOfPools] = useState<number | undefined>();
  const [numberOfFetchedPools, setNumberOfFetchedPools] = useState<number>(0);
  const [incrementalPools, setIncrementalPools] = useState<PoolInfo[] | null>();

  useEffect(() => {
    window.addEventListener('totalNumberOfPools', (res) => setTotalNumberOfPools(res.detail));
    window.addEventListener('numberOfFetchedPools', (res) => setNumberOfFetchedPools(res.detail));
    window.addEventListener('incrementalPools', (res) => setIncrementalPools(res.detail));
  }, []);

  const getPools = useCallback(async (api: ApiPromise) => {
    const lastPoolId = ((await api.query.nominationPools.lastPoolId())?.toNumber() || 0) as number;

    console.log(`getPools: Getting ${lastPoolId} pools information.`);

    window.dispatchEvent(new CustomEvent('totalNumberOfPools', { detail: lastPoolId }));

    if (!lastPoolId) {
      setTotalNumberOfPools(undefined);
      setNumberOfFetchedPools(0);
      setIncrementalPools(null);

      return;
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
          api.query['nominationPools']['metadata'](poolId),
          api.query['nominationPools']['bondedPools'](poolId),
          api.query['nominationPools']['rewardPools'](poolId),
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
  }, []);

  useEffect(() => {
    api && getPools(api).catch(console.error);
  }, [api, getPools]);

  return {
    incrementalPools,
    numberOfFetchedPools,
    totalNumberOfPools
  };
}
