// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { useCallback, useContext, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { FetchingContext } from '../components';
import { isHexToBn } from '../util/utils';
import { useEndpoint2, useFormatted } from '.';

export default function usePool(address: AccountId | string, id?: number, refresh?: boolean, pool?: MyPoolInfo): MyPoolInfo | null | undefined {
  const formatted = useFormatted(address);
  const endpoint = useEndpoint2(address);
  const isFetching = useContext(FetchingContext);
  const [myPool, setMyPool] = useState<MyPoolInfo | undefined | null>();
  const [waiting, setWaiting] = useState<boolean>();

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

        /** reset isFetching */
        isFetching.fetching[String(stakerAddress)].getPool = false;
        isFetching.set(isFetching.fetching);

        chrome.storage.local.get('MyPools', (res) => {
          const k = `${stakerAddress}`;
          const mySavedPools = res?.MyPools || {};

          mySavedPools[k] = null; // to remove old saved pool, even set empty for not already pool staked account

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ MyPools: mySavedPools });

          // if (mySavedPools) {
          //   if (mySavedPools[k]) {
          //     delete mySavedPools[k];
          //     // eslint-disable-next-line no-void
          //     void chrome.storage.local.set({ MyPools: mySavedPools });
          //   }
          // }
        });

        getPoolWorker.terminate();

        return;
      }

      const parsedInfo = JSON.parse(info) as MyPoolInfo;

      /** convert hex strings to BN strings*  MUST be string since nested BNs can not be saved in local storage safely*/
      if (parsedInfo.member) {
        parsedInfo.member.points = isHexToBn(parsedInfo.member.points).toString();
      }

      parsedInfo.bondedPool.points = isHexToBn(parsedInfo.bondedPool.points).toString();
      parsedInfo.stashIdAccount.stakingLedger.active = isHexToBn(parsedInfo.stashIdAccount.stakingLedger.active).toString();
      parsedInfo.stashIdAccount.stakingLedger.total = isHexToBn(parsedInfo.stashIdAccount.stakingLedger.total).toString();

      console.log('*** My pool info returned from worker is:', parsedInfo);

      setMyPool(parsedInfo);

      /** reset isFetching */
      isFetching.fetching[String(stakerAddress)].getPool = false;
      isFetching.set(isFetching.fetching);

      /** save my pool to local storage if it is not fetched by id, note, a pool to join is fetched by Id*/
      !id && chrome.storage.local.get('MyPools', (res) => {
        const k = `${stakerAddress}`;
        const last = res?.MyPools || {};

        parsedInfo.date = Date.now();
        last[k] = parsedInfo;

        // eslint-disable-next-line no-void
        void chrome.storage.local.set({ MyPools: last });
      });

      getPoolWorker.terminate();
    };
  }, [isFetching]);

  useEffect(() => {
    if (pool !== undefined) {
      setMyPool(pool);
    }

    if (!endpoint || !formatted) {
      return;
    }

    if (id) { /** do not save pool in local storage when pool is fetched via id, which is used in join pool page */
      getPoolInfo(endpoint, formatted, id);

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
      setWaiting(true);
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

      if (res?.MyPools?.[formatted] !== undefined) {
        setMyPool(res.MyPools[formatted]);

        return;
      }

      setMyPool(undefined);
    });
  }, [formatted]);

  useEffect(() => {
    if (!formatted || !waiting) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key === 'MyPools' && namespace === 'local') {
          setMyPool(newValue[formatted]);
          setWaiting(false);
        }
      }
    });
  }, [formatted, waiting]);

  return myPool;
}
