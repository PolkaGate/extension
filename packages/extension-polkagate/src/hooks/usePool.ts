// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { useEndpoint2, useFormatted } from '.';

export default function usePool(address: string, id?: number, refresh?: boolean, pool?: MyPoolInfo): MyPoolInfo | null | undefined {
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
        /** remove saved old pool from local storage if any */
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

      /** save my pool to local storage if it is not fetched by id, note, a pool to join is fetched by Id*/
      !id && chrome.storage.local.get('MyPools', (res) => {
        const k = `${formatted}`;
        const last = res?.MyPools ?? {};

        parsedInfo.date = Date.now();
        last[k] = parsedInfo;
        // eslint-disable-next-line no-void
        void chrome.storage.local.set({ MyPools: last });
      });

      getPoolWorker.terminate();
    };
  }, [formatted]);

  useEffect(() => {
    if (pool !== undefined) {
      setMyPool(pool);
    }

    endpoint && formatted && getPoolInfo(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolInfo, id, pool]);

  useEffect(() => {
    if (!formatted) {
      return;
    }

    /** load pool from storage */
    chrome.storage.local.get('MyPools', (res) => {
      console.log('MyPools in local storage:', res);

      if (res?.MyPools?.[formatted]) {
        setMyPool(res.MyPools[formatted]);

        return;
      }

      setMyPool(undefined);
    });
  }, [formatted]);

  useEffect(() => {
    refresh && console.log('refreshing ...');
    endpoint && refresh && formatted && getPoolInfo(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolInfo, id, refresh]);

  return myPool;
}
