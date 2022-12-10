// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { useEndpoint2, useFormatted } from '.';

export default function usePool(address: string, id?: number, statePool?: MyPoolInfo, refresh?: boolean): MyPoolInfo | null | undefined {
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
        /** remove saved pool from local storage if any */
        chrome.storage.local.get('MyPools', (res) => {
          const k = `${formatted}`;
          const last = res?.MyPools ?? {};

          last[k] = null;
          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ MyPools: last });
        });


        getPoolWorker.terminate();

        return;
      }

      const parsedInfo = JSON.parse(info) as MyPoolInfo;

      console.log('*** My pool info returned from worker is:', parsedInfo);

      setMyPool(parsedInfo);

      /** save my pool to local storage */
      chrome.storage.local.get('MyPools', (res) => {
        const k = `${formatted}`;
        const last = res?.MyPools ?? {};

        last[k] = parsedInfo;
        // eslint-disable-next-line no-void
        void chrome.storage.local.set({ MyPools: last });
      });

      getPoolWorker.terminate();
    };
  }, [formatted]);

  useEffect(() => {
    if (statePool !== undefined) {
      return setMyPool(statePool);
    }

    endpoint && formatted && getPoolInfo(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolInfo, id, statePool]);

  useEffect(() => {
    if (!formatted) {
      return;
    }

    /** load pool from storage */
    chrome.storage.local.get('MyPools', (res) => {
      console.log('MyPools in local storage:', res);

      if (res?.MyPools?.[formatted]) {
        setMyPool(res.MyPools[formatted]);
      }
    });
  }, [formatted]);

  useEffect(() => {
    refresh && console.log('refreshing ...');
    endpoint && refresh && formatted && getPoolInfo(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolInfo, id, statePool, refresh]);

  return myPool;
}
