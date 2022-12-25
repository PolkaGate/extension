// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AllValidators, Validators } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { useChain, useChainName, useCurrentEraIndex, useEndpoint2 } from '.';

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

export default function useValidators(address: string, validators?: AllValidators): AllValidators | null | undefined {
  const [info, setValidatorsInfo] = useState<AllValidators | undefined | null>();
  const [newInfo, setNewValidatorsInfo] = useState<AllValidators | undefined | null>();
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);
  const currentEraIndex = useCurrentEraIndex(address);
  const chainName = useChainName(address);

  const getValidatorsInfo = useCallback((chain: Chain, endpoint: string, savedValidators = []) => {
    const getValidatorsInfoWorker: Worker = new Worker(new URL('../util/workers/getValidatorsInfo.js', import.meta.url));

    getValidatorsInfoWorker.postMessage({ endpoint });

    getValidatorsInfoWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsInfoWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: Validators | null = e.data;

      if (info && JSON.stringify(savedValidators) !== JSON.stringify(info)) {
        setNewValidatorsInfo(info);

        // if (chainName !== 'Westend') {
        //   window.localStorage.setItem(`${chainName}_allValidatorsInfo`, JSON.stringify(info));
        // }

        chrome.storage.local.get('validatorsInfo', (res) => {
          const k = `${chainName}`;
          const last = res?.validatorsInfo ?? {};

          last[k] = info;
          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ validatorsInfo: last });
        });
      }

      getValidatorsInfoWorker.terminate();
    };
  }, [chainName]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    // const localSavedAllValidatorsInfo = window.localStorage.getItem(`${chainName}_allValidatorsInfo`);

    // if (localSavedAllValidatorsInfo) {
    //   const parsedLocalSavedAllValidatorsInfo = JSON.parse(localSavedAllValidatorsInfo) as Validators;

    //   setValidatorsInfo(parsedLocalSavedAllValidatorsInfo);
    //   console.log(`validatorsInfo in storage is from era: ${parsedLocalSavedAllValidatorsInfo?.eraIndex} on chain: ${chainName}`);
    // }
     // eslint-disable-next-line no-void
     void chrome.storage.local.get('validatorsInfo', (res: { [key: string]: Validators }) => {
      console.log('Saved validatorsInfo:', res);

      if (res?.validatorsInfo?.[chainName]) {
        setValidatorsInfo(res.validatorsInfo[chainName]?.accountsInfo);
        // setSavedEraIndex(res.validatorsInfo[chainName]?.eraIndex);
      }
    });
  }, [chainName]);

  useEffect(() => {
    if (validators) {
      setNewValidatorsInfo(validators);

      return;
    }

    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    endpoint && chain && currentEraIndex && currentEraIndex !== info?.eraIndex && getValidatorsInfo(chain, endpoint, info);
  }, [endpoint, chain, getValidatorsInfo, info, currentEraIndex, validators]);

  return newInfo || info;
}
