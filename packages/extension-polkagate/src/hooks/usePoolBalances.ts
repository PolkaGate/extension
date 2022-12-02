// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { useEndpoint2, useFormatted } from '.';

export default function usePoolBalances(address: string, id?: number, statePool?: MyPoolInfo, refresh?: boolean): MyPoolInfo | null | undefined {
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>();
  const formatted = useFormatted(address);
  const endpoint = useEndpoint2(address);

  const getPoolBalances = useCallback((endpoint: string, stakerAddress: string, id: number | undefined = undefined) => {
    const getPoolWorker: Worker = new Worker(new URL('../util/workers/getPoolBalances.js', import.meta.url));

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

      console.log('* My pool balances returned from worker is:', parsedInfo);

      setMyPool(parsedInfo);
      getPoolWorker.terminate();
    };
  }, []);

  useEffect(() => {
    if (statePool) {
      return setMyPool(statePool);
    }

    endpoint && formatted && getPoolBalances(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolBalances, id, statePool]);

  useEffect(() => {
    refresh && console.log('refreshing ...');
    endpoint && refresh && formatted && getPoolBalances(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolBalances, id, statePool, refresh]);

  return myPool;
}
