// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useEndpoint2 } from '.';

export default function usePools(address: string): PoolInfo[] | null | undefined {
  const [pools, setPools] = useState<PoolInfo[] | undefined | null>();
  const endpoint = useEndpoint2(address);

  const getPools = useCallback((endpoint: string) => {
    const getPoolsWorker: Worker = new Worker(new URL('../util/workers/getPools.js', import.meta.url));

    getPoolsWorker.postMessage({ endpoint });

    getPoolsWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolsWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const poolsInfo: string = e.data;

      if (!poolsInfo) {
        setPools(null);// noo pools found, probably never happens

        return;
      }

      const parsedPoolsInfo = JSON.parse(poolsInfo);
      const info = parsedPoolsInfo.info as PoolInfo[];

      info?.forEach((p: PoolInfo) => {
        if (p?.bondedPool?.points) {
          p.bondedPool.points = new BN(String(p.bondedPool.points));
        }

        p.poolId = new BN(p.poolId);
      });

      setPools(info);

      getPoolsWorker.terminate();
    };
  }, []);

  useEffect(() => {
    endpoint && getPools(endpoint);
  }, [endpoint, getPools]);

  return pools;
}
