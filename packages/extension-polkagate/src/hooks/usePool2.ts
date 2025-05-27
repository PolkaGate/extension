// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyPoolInfo } from '../util/types';

import { type Dispatch, type SetStateAction, useCallback, useContext, useEffect, useState } from 'react';

import { FetchingContext, WorkerContext } from '../components';
import { isHexToBn } from '../util/utils';
import { useFormatted3 } from '.';

const MY_POOL_STORAGE_KEY = 'MyPool';
const MY_POOL_SHARED_WORKER_KEY = 'getPool';

interface WorkerMessage {
  functionName?: string;
  results?: string;
}

export default function usePool2 (address: string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: Dispatch<SetStateAction<boolean>>): MyPoolInfo | null | undefined {
  const worker = useContext(WorkerContext);

  const formatted = useFormatted3(address, genesisHash);
  const isFetching = useContext(FetchingContext);

  const [savedPool, setSavedPool] = useState<MyPoolInfo | undefined | null>(undefined);
  const [newPool, setNewPool] = useState<MyPoolInfo | undefined | null>(undefined);

  const fetchPoolInformation = useCallback(() => {
    if (!worker || !genesisHash || !formatted) {
      return;
    }

    worker.postMessage({ functionName: MY_POOL_SHARED_WORKER_KEY, parameters: { genesisHash, stakerAddress: formatted } });
  }, [formatted, genesisHash, worker]);

  const handleWorkerMessages = useCallback(() => {
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
      isFetching.fetching[String(formatted)][MY_POOL_SHARED_WORKER_KEY] = false;
      isFetching.set(isFetching.fetching);

      if (!results) {
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

        console.log('*** My pool info from worker is:', receivedMessage);

        // save my pool to local storage
        chrome.storage.local.get(MY_POOL_STORAGE_KEY, (res) => {
          const last = res?.[MY_POOL_STORAGE_KEY] || {};

          receivedMessage.date = Date.now();
          last[formatted] = receivedMessage;

          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ [MY_POOL_STORAGE_KEY]: last });
        });

        setNewPool(receivedMessage);
      }
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
    };
  }, [formatted, isFetching, worker]);

  useEffect(() => {
    if (!formatted) {
      return;
    }

    if (!isFetching.fetching[String(formatted)]?.['getPool']) {
      if (!isFetching.fetching[String(formatted)]) {
        isFetching.fetching[String(formatted)] = {}; // to initialize
      }

      isFetching.fetching[String(formatted)]['getPool'] = true;
      isFetching.set(isFetching.fetching);

      fetchPoolInformation();
      handleWorkerMessages();
    } else {
      console.log(`getPool is already called for ${formatted}, hence doesn't need to call it again!`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching.fetching[String(formatted)]?.['length'], formatted, fetchPoolInformation]);

  useEffect(() => {
    if (refresh && setRefresh) {
      console.log('refreshing ...');

      fetchPoolInformation();
      handleWorkerMessages();
      setRefresh(false);
    }
  }, [fetchPoolInformation, handleWorkerMessages, refresh, setRefresh]);

  useEffect(() => {
    if (!formatted) {
      return;
    }

    /** load pool from storage */
    chrome.storage.local.get(MY_POOL_STORAGE_KEY, (res) => {
      console.log('MyPools in local storage:', res);

      const myPool = res?.[MY_POOL_STORAGE_KEY]?.[formatted] as MyPoolInfo | null | undefined;

      if (myPool !== undefined) {
        setSavedPool(myPool);

        return;
      }

      setSavedPool(undefined);
    });
  }, [formatted]);

  return newPool ?? savedPool;
}
