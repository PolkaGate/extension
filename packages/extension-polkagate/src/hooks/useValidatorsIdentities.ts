// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';

import { useCallback, useEffect, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { useChain, useEndpoint2 } from '.';

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

const getKey = (chainName) => {
  switch (chainName) {
    case ('Westend'):
      return 'Westend_validatorsIdentities';
    default:
      return null;
  }
};

export default function useValidatorsIdentities(address: string, allValidatorsIds: AccountId[] | null | undefined): DeriveAccountInfo[] | null | undefined {
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');
  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [newValidatorsIdentities, setNewValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [isGetting, setIsGetting] = useState<boolean>();

  const getValidatorsIdentities = useCallback((endpoint: string, validatorsAccountIds: AccountId[]) => {
    /** get validators identities */
    const getValidatorsIdWorker: Worker = new Worker(new URL('../util/workers/getValidatorsIdentities.js', import.meta.url));

    getValidatorsIdWorker.postMessage({ endpoint, validatorsAccountIds });

    getValidatorsIdWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsIdWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const identities: DeriveAccountInfo[] | null = e.data;

      console.log(`got ${identities?.length ?? ''} validators identities from ${chain?.name} `);

      /** if fetched differs from saved then setIdentities and save to local storage */
      if (identities?.length && JSON.stringify(validatorsIdentities) !== JSON.stringify(identities)) {
        console.log(`setting new identities #old was: ${validatorsIdentities?.length ?? ''} `);

        setNewValidatorsIdentities(identities);
        setIsGetting(false);

        if (chainName?.toLocaleLowerCase() !== 'westend') {
          chrome.storage.local.get('validatorsIdentities', (res) => {
            const k = `${chainName}`;
            const last = res?.validatorsIdentities ?? {};

            last[k] = identities;
            // eslint-disable-next-line no-void
            void chrome.storage.local.set({ validatorsIdentities: last });
          });
        }
      }

      getValidatorsIdWorker.terminate();
    };
  }, [chain?.name, chainName, validatorsIdentities]);

  useEffect(() => {
    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    if (endpoint && allValidatorsIds && !newValidatorsIdentities && !isGetting) {
      setIsGetting(true);
      getValidatorsIdentities(endpoint, allValidatorsIds);
    }
  }, [endpoint, getValidatorsIdentities, allValidatorsIds, newValidatorsIdentities, isGetting]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    chrome.storage.local.get('validatorsIdentities', (res) => {
      console.log('localSavedValidatorsIdentities:', res);

      if (res?.validatorsIdentities?.[chainName]) {
        setValidatorsIdentities(res.validatorsIdentities[chainName]);
      }
    });
  }, [chainName]);

  return newValidatorsIdentities ?? validatorsIdentities;
}
