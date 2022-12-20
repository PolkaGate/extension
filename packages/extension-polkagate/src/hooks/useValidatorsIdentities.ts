// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';

import { useCallback, useEffect, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { ValidatorsIdentities } from '../util/types';
import { useChainName, useCurrentEraIndex, useEndpoint2 } from '.';

export default function useValidatorsIdentities(address: string, allValidatorsIds: AccountId[] | null | undefined): DeriveAccountInfo[] | null | undefined {
  const endpoint = useEndpoint2(address);
  const chainName = useChainName(address);
  const currentEraIndex = useCurrentEraIndex(address);

  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [newValidatorsIdentities, setNewValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [savedEraIndex, setSavedEraIndex] = useState<number | undefined>();

  const getValidatorsIdentities = useCallback((endpoint: string, validatorsAccountIds: AccountId[]) => {
    /** get validators identities */
    const getValidatorsIdWorker: Worker = new Worker(new URL('../util/workers/getValidatorsIdentities.js', import.meta.url));

    getValidatorsIdWorker.postMessage({ endpoint, validatorsAccountIds });

    getValidatorsIdWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsIdWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: ValidatorsIdentities | null = e.data;
      const identities = info?.accountsInfo;

      console.log(`got ${identities?.length ?? ''} validators identities from ${chainName} `);

      /** if fetched differs from saved then setIdentities and save to local storage */
      if (info && identities?.length && info.eraIndex !== savedEraIndex) {
        console.log(`setting new identities #old was: ${validatorsIdentities?.length ?? ''} `);

        setNewValidatorsIdentities(info.identities);

        if (chainName?.toLocaleLowerCase() !== 'westend') {
          chrome.storage.local.get('validatorsIdentities', (res) => {
            const k = `${chainName}`;
            const last = res?.validatorsIdentities ?? {};

            last[k] = info;
            // eslint-disable-next-line no-void
            void chrome.storage.local.set({ validatorsIdentities: last });
          });
        }
      }

      getValidatorsIdWorker.terminate();
    };
  }, [chainName, savedEraIndex, validatorsIdentities?.length]);

  useEffect(() => {
    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    endpoint && allValidatorsIds && !newValidatorsIdentities && currentEraIndex && currentEraIndex !== savedEraIndex && getValidatorsIdentities(endpoint, allValidatorsIds);
  }, [endpoint, getValidatorsIdentities, allValidatorsIds, newValidatorsIdentities, currentEraIndex, savedEraIndex]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    chrome.storage.local.get('validatorsIdentities', (res) => {
      console.log('localSavedValidatorsIdentities:', res);

      if (res?.validatorsIdentities?.[chainName]) {
        setValidatorsIdentities(res.validatorsIdentities[chainName]?.identities);
        setSavedEraIndex(res.validatorsIdentities[chainName]?.eraIndex)
      }
    });
  }, [chainName]);

  return newValidatorsIdentities || validatorsIdentities;
}
