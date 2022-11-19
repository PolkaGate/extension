// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AllValidators, SavedMetaData, Validators } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import { useAccount, useChain, useEndpoint2 } from '.';

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

export default function useValidators(address: string): AllValidators | null | undefined {
  const [info, setValidatorsInfo] = useState<AllValidators | undefined | null>();
  const endpoint = useEndpoint2(address);
  const account = useAccount(address);
  const chain = useChain(address);
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');

  console.log('account in useValidators:', account);

  const getValidatorsInfo = useCallback((chain: Chain, endpoint: string, savedValidators = []) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../util/workers/getValidatorsInfo.js', import.meta.url));

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fetchedValidatorsInfo: Validators | null = e.data;

      if (fetchedValidatorsInfo && JSON.stringify(savedValidators?.metaData) !== JSON.stringify(fetchedValidatorsInfo)) {
        setValidatorsInfo(fetchedValidatorsInfo);

        updateMeta(address, prepareMetaData(chain, 'allValidatorsInfo', fetchedValidatorsInfo)).catch(console.error);
      }

      getValidatorsInfoWorker.terminate();
    };
  }, [address]);

  useEffect(() => {
    console.log('chain  endpoint:', chain,endpoint );


    if (!chain || !chainName || !endpoint || !account) {
      return;
    }

    /** retrieve validatorInfo from local storage */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const savedValidators: SavedMetaData = account.allValidatorsInfo ? JSON.parse(account.allValidatorsInfo) : null;
    console.log('savedValidators in useValidators:', savedValidators);

    if (savedValidators && savedValidators?.chainName === chainName) {
      console.log(`validatorsInfo is set from local storage current:${savedValidators.metaData?.current?.length} waiting:${savedValidators.metaData?.waiting?.length}`);

      setValidatorsInfo(savedValidators.metaData as Validators);

      console.log(`validatorsInfo in storage is from era: ${savedValidators.metaData.currentEraIndex}
       on chain: ${savedValidators?.chainName}`);
    }

    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    endpoint && getValidatorsInfo(chain, endpoint, savedValidators);
  }, [endpoint, chain, account, chainName, getValidatorsInfo]);

  return info;
}
