// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { useCallback, useEffect, useState } from 'react';
import { createWsEndpoints } from '@polkadot/apps-config';

const DATABASE_NAME = 'PolkaGateDBIcons';
const OBJECT_STORE_NAME = 'Icons';

export default function useLogo (name: string | undefined): string | null | undefined {
  const [logo, setLogo] = useState<string | null | undefined>();
  const allEndpoints = createWsEndpoints();
  console.log('allEndpoints:', allEndpoints)
  const lowerCaseName = name?.toLowerCase();

  const getLogo = useCallback((logoName: string) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onsuccess = (event) => {
      const db = event.target.result;

      const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

      const getRequest = objectStore.get(logoName);

      getRequest.onsuccess = (event) => {
        const result = event.target.result as string;

        if (result) {
          setLogo(result);
        } else {
          console.log('get version failed, no database found');

          setLogo(null);
        }

        db.close();
      };

      getRequest.onerror = () => {
        console.error('Error retrieving version');
        setLogo(null);

        db.close();
      };

      // Complete the transaction
      transaction.oncomplete = () => {
        console.log('Transaction completed');
      };

      transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.error);
        setLogo(null);
      };
    };
  }, []);

  useEffect(() => {
    if (!lowerCaseName) {
      return;
    }

    getLogo(lowerCaseName);
  }, [getLogo, lowerCaseName]);

  return logo;
}
