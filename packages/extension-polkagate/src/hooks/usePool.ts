// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useContext, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, hexToBn, isHex } from '@polkadot/util';

import { FetchingContext } from '../components';
import { useEndpoint2, useFormatted } from '.';

export default function usePool(address: AccountId | string, id?: number, refresh?: boolean, pool?: MyPoolInfo): MyPoolInfo | null | undefined {
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>();
  const formatted = useFormatted(address);
  const endpoint = useEndpoint2(address);
  const isFetching = useContext(FetchingContext);

  const getPoolInfo = useCallback((endpoint: string, stakerAddress: AccountId | string, id: number | undefined = undefined) => {
    const getPoolWorker: Worker = new Worker(new URL('../util/workers/getPool.js', import.meta.url));

    getPoolWorker.postMessage({ endpoint, id, stakerAddress });

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

      /** convert hex strings to BN strings*/
      parsedInfo.member.points = (isHex(parsedInfo.member.points) ? hexToBn(parsedInfo.member.points) : new BN(parsedInfo.member.points)).toString();
      parsedInfo.bondedPool.points = (isHex(parsedInfo.bondedPool.points) ? hexToBn(parsedInfo.bondedPool.points) : new BN(parsedInfo.bondedPool.points)).toString();
      parsedInfo.stashIdAccount.stakingLedger.active = (isHex(parsedInfo.stashIdAccount.stakingLedger.active) ? hexToBn(parsedInfo.stashIdAccount.stakingLedger.active) : new BN(parsedInfo.stashIdAccount.stakingLedger.active)).toString();
      parsedInfo.stashIdAccount.stakingLedger.total = (isHex(parsedInfo.stashIdAccount.stakingLedger.total) ? hexToBn(parsedInfo.stashIdAccount.stakingLedger.total) : new BN(parsedInfo.stashIdAccount.stakingLedger.total)).toString();

      console.log('*** My pool info returned from worker is:', parsedInfo);

      setMyPool(parsedInfo);

      /** reset isFetching */
      isFetching.fetching[String(formatted)].getPool = false;
      isFetching.set(isFetching.fetching);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatted, isFetching.fetching[String(formatted)]?.length]);

  useEffect(() => {
    if (pool !== undefined) {
      setMyPool(pool);
    }

    if (!endpoint || !formatted) {
      return;
    }

    if (!isFetching.fetching[String(formatted)]?.getPool) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {}; // to initialize
      }

      isFetching.fetching[String(formatted)].getPool = true;
      isFetching.set(isFetching.fetching);

      getPoolInfo(endpoint, formatted, id);
    } else {
      console.log(`getPool is already called for ${formatted}, hence doesn't need to call it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching.fetching[String(formatted)]?.length, endpoint, formatted, getPoolInfo, id, pool]);

  useEffect(() => {
    refresh && console.log('refreshing ...');
    endpoint && refresh && formatted && getPoolInfo(endpoint, formatted, id);
  }, [endpoint, formatted, getPoolInfo, id, refresh]);

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

  return myPool;
}
