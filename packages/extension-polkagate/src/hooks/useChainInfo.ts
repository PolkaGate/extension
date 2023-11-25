// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { sanitizeChainName } from '../util/utils';
import { useChainName } from './';

const DATABASE_NAME = 'PolkaGateDB';
const OBJECT_STORE_NAME = 'ChainsInformation';

export default function useChainInfo(address: AccountId | string | undefined) {
  const chainName = useChainName(address);

  const [chainInfo, setChainInfo] = useState();

  const sanitizedChainName = sanitizeChainName(chainName);

  const getInformation = useCallback(() => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

      const getRequest = objectStore.get(sanitizedChainName);

      getRequest.onsuccess = (event) => {
        const result = event.target.result;

        if (result) {
          setChainInfo(result);
        } else {
          console.log('get version failed, no database found');

          setChainInfo(null);
        }

        db.close();
      };

      getRequest.onerror = (event) => {
        console.error('Error retrieving version');
        setChainInfo(null);

        db.close();
      };

      // Complete the transaction
      transaction.oncomplete = () => {
        console.log('Transaction completed');
      };

      transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.error);
        setChainInfo(null);
      };
    };
  }, [sanitizedChainName]);

  useEffect(() => {
    if (!address || !sanitizedChainName) {
      return;
    }

    getInformation();
  }, [address, getInformation, sanitizedChainName]);

  return chainInfo;
}
