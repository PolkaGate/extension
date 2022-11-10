// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SavedMetaData, Validators } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import { useChain, useEndpoint2 } from '.';

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

export default function useValidators(address: string, validatorsInfoFromStore?: SavedMetaData): Validators | null | undefined {
  const [info, setInfo] = useState<Validators | undefined | null>();
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);

  const getValidatorsInfo = useCallback((chain: Chain, endpoint: string, validatorsInfoFromStore = []) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../util/workers/getValidatorsInfo.js', import.meta.url));

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fetchedValidatorsInfo: Validators | null = e.data;

      if (fetchedValidatorsInfo && JSON.stringify(validatorsInfoFromStore?.metaData) !== JSON.stringify(fetchedValidatorsInfo)) {
        setInfo(fetchedValidatorsInfo);

        // eslint-disable-next-line no-void
        void updateMeta(address, prepareMetaData(chain, 'validatorsInfo', fetchedValidatorsInfo));
      }

      getValidatorsInfoWorker.terminate();
    };
  }, [address]);

  useEffect(() => {
    chain && endpoint && getValidatorsInfo(chain, endpoint, validatorsInfoFromStore);
  }, [chain, endpoint, getValidatorsInfo, validatorsInfoFromStore]);

  return info;
}
