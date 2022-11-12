// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { useEndpoint2, useFormatted } from '.';

export default function usePool(address: string, id?: number, statePool?: MyPoolInfo): MyPoolInfo | null | undefined {
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>();
  const formatted = useFormatted(address);
  const endpoint = useEndpoint2(address);

  const getPoolInfo = useCallback((endpoint: string, stakerAddress: string, id: number | undefined = undefined) => {
    const getPoolWorker: Worker = new Worker(new URL('../util/workers/getPool.js', import.meta.url));

    getPoolWorker.postMessage({ endpoint, stakerAddress, id });

    getPoolWorker.onerror = (err) => {
      console.log(err);
    };

    getPoolWorker.onmessage = (e: MessageEvent<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: string = e.data;

      if (!info) {
        setMyPool(null);

        getPoolWorker.terminate();

        return;
      }

      const parsedInfo = JSON.parse(info) as MyPoolInfo;


      console.log('*** My pool info returned from worker is:', parsedInfo);

      // id ? setSelectedPool(parsedInfo) :
      setMyPool(parsedInfo);
      getPoolWorker.terminate();
    };
  }, []);

  useEffect(() => {
    if (statePool) {
      return setMyPool(statePool);
    }

    endpoint && formatted && getPoolInfo(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolInfo, id, statePool]);

  return myPool;
}
