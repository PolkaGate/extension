// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import type { MyPoolInfo } from '../util/types';

import { type Dispatch, type SetStateAction, useCallback, useContext, useEffect, useState } from 'react';

import { FetchingContext, WorkerContext } from '../components';
import { getStorage, setStorage } from '../util';
import { isHexToBn } from '../util';
import { STORAGE_KEY } from '../util/constants';
import useFormatted from './useFormatted';

const MY_POOL_SHARED_WORKER_KEY = 'getPool';

interface WorkerMessage {
  functionName?: string;
  results?: string;
}

export default function usePool (address: string | undefined, genesisHash: string | undefined, id?: number, refresh?: boolean, setRefresh?: Dispatch<SetStateAction<boolean>>): MyPoolInfo | null | undefined {
  const worker = useContext(WorkerContext);

  const formatted = useFormatted(address, genesisHash);
  const isFetching = useContext(FetchingContext);

  const [savedPool, setSavedPool] = useState<MyPoolInfo | undefined | null>(undefined);
  const [newPool, setNewPool] = useState<MyPoolInfo | undefined | null>(undefined);

  const fetchPoolInformation = useCallback(() => {
    if (!worker || !genesisHash || !formatted) {
      return;
    }

    // the sort in this object is important because the getPool use the params as they pass
    // eslint-disable-next-line sort-keys
    worker.postMessage({ functionName: MY_POOL_SHARED_WORKER_KEY, parameters: { genesisHash, stakerAddress: formatted, id } });
  }, [formatted, genesisHash, id, worker]);

  useEffect(() => {
    if (!worker || !formatted) {
      return;
    }

    const handleMessage = (messageEvent: MessageEvent<string>) => {
      const message = messageEvent.data;

      if (!message) {
        return; // may receive unknown messages!
      }

      const { functionName, results } = JSON.parse(message) as WorkerMessage;

      if (!functionName) {
        return;
      }

      /** reset isFetching */
      isFetching.fetching[String(formatted)][id ? 'id' : MY_POOL_SHARED_WORKER_KEY] = false;
      isFetching.set(isFetching.fetching);

      if (!results || results === 'null') {
        setNewPool(null);

        return;
      }

      if (functionName === MY_POOL_SHARED_WORKER_KEY) {
        const receivedMessage = JSON.parse(results) as MyPoolInfo;

        /** convert hex strings to BN strings*  MUST be string since nested BNs can not be saved in local storage safely*/
        if (receivedMessage.member) {
          receivedMessage.member.points = isHexToBn(receivedMessage.member.points).toString();
        }

        receivedMessage.bondedPool.points = isHexToBn(receivedMessage.bondedPool.points).toString();
        receivedMessage.stashIdAccount.stakingLedger.active = isHexToBn(receivedMessage.stashIdAccount.stakingLedger.active).toString();
        receivedMessage.stashIdAccount.stakingLedger.total = isHexToBn(receivedMessage.stashIdAccount.stakingLedger.total).toString();

        console.log('** My pool info from worker is:', receivedMessage);

        // save my pool to local storage
        // if id is available there is no reason to save the pool information in the "MyPool" storage!
        !id && getStorage(STORAGE_KEY.MY_POOL).then((res) => {
          const last = res || {};

          receivedMessage.date = Date.now();
          (last as Record<string, MyPoolInfo>)[formatted] = receivedMessage;

          setStorage(STORAGE_KEY.MY_POOL, last).catch(console.error);
        }).catch(console.error);

        setNewPool(receivedMessage);
      }
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [formatted, id, isFetching, worker]);

  useEffect(() => {
    if (!formatted || !id) {
      !id && console.log('The getPool is calling to get the pool for a specific address on a specific network, which the other useEffect will handle it!');

      return;
    }

    if (!isFetching.fetching[String(formatted)]?.['id']) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {}; // to initialize
      }

      isFetching.fetching[String(formatted)]['id'] = true;
      isFetching.set(isFetching.fetching);

      fetchPoolInformation();
    } else {
      console.log(`getPool is already called for ${formatted}, hence doesn't need to call it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching.fetching[String(formatted)]?.['length'], formatted, fetchPoolInformation]);

  useEffect(() => {
    if (!formatted || id) {
      id && console.log('The getPool is calling for a specific pool id, which the other useEffect will handle it!');

      return;
    }

    if (!isFetching.fetching[String(formatted)]?.['getPool']) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {}; // to initialize
      }

      isFetching.fetching[String(formatted)]['getPool'] = true;
      isFetching.set(isFetching.fetching);

      fetchPoolInformation();
    } else {
      console.log(`getPool is already called for ${formatted}, hence doesn't need to call it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching.fetching[String(formatted)]?.['length'], formatted, fetchPoolInformation]);

  useEffect(() => {
    if (refresh && setRefresh) {
      console.log('refreshing ...');

      fetchPoolInformation();

      setRefresh(false);
    }
  }, [fetchPoolInformation, refresh, setRefresh]);

  useEffect(() => {
    if (!formatted) {
      return;
    }

    /** load pool from storage */
    getStorage(STORAGE_KEY.MY_POOL).then((res) => {
      console.log('MyPools in local storage:', res);

      let myPool: MyPoolInfo | null | undefined;

      if (res && typeof res === 'object' && formatted) {
        myPool = (res as Record<string, MyPoolInfo | null | undefined>)[formatted];
      }

      if (myPool !== undefined) {
        setSavedPool(myPool);

        return;
      }

      setSavedPool(undefined);
    }).catch(console.error);
  }, [formatted]);

  return newPool ?? savedPool;
}
