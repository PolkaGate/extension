// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { AUTO_MODE } from '../util/constants';
import { isHexToBn } from '../util/utils';
import { useInfo } from '.';

export default function useMyPools(address: string): MyPoolInfo[] | null | undefined {
  const [myPools, setMyPools] = useState<MyPoolInfo[] | undefined | null>();
  const { endpoint, formatted } = useInfo(address);

  const getMyPools = useCallback((formatted: string, endpoint: string) => {
    const getMyPoolsWorker: Worker = new Worker(new URL('../util/workers/getMyPools.js', import.meta.url));

    getMyPoolsWorker.postMessage({ address: formatted, endpoint });

    getMyPoolsWorker.onerror = (err) => {
      console.log(err);
    };

    getMyPoolsWorker.onmessage = (e: MessageEvent<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const poolsInfo: string = e.data;

      if (!poolsInfo) {
        setMyPools(null);// noo pools found, probably never happens

        return;
      }

      const parsedPoolsInfo = JSON.parse(poolsInfo) as MyPoolInfo[];

      parsedPoolsInfo?.forEach((p: MyPoolInfo) => {
        if (p?.bondedPool?.points) {
          // @ts-ignore
          p.bondedPool.points = isHexToBn(p.bondedPool.points);
        }
      });

      console.log('My other pools:', parsedPoolsInfo);
      setMyPools(parsedPoolsInfo.length ? parsedPoolsInfo : null);

      getMyPoolsWorker.terminate();
    };
  }, []);

  useEffect(() => {
    formatted && endpoint && endpoint !== AUTO_MODE.value && getMyPools(String(formatted), endpoint);
  }, [formatted, endpoint, getMyPools]);

  return myPools;
}
