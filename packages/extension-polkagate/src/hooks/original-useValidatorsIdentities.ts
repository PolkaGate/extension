// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';

import { useCallback, useEffect, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { sanitizeChainName } from '../util/utils';
import { useChain, useEndpoint2 } from '.';

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

export default function useValidatorsIdentities(address: string, allValidatorsIds: AccountId[] | null | undefined): DeriveAccountInfo[] | null | undefined {
  const endpoint = useEndpoint2(address);
  const chain = useChain(address);
  const chainName = sanitizeChainName(chain?.name);
  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();
  const [newValidatorsIdentities, setNewValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();

  const getValidatorsIdentities = useCallback((endpoint: string, validatorsAccountIds: AccountId[]) => {
    /** get validators identities */
    const getValidatorsIdWorker: Worker = new Worker(new URL('../util/workers/getValidatorsIdentities.js', import.meta.url));

    getValidatorsIdWorker.postMessage({ endpoint, validatorsAccountIds });

    getValidatorsIdWorker.onerror = (err) => {
      console.log(err);
    };

    getValidatorsIdWorker.onmessage = (e) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fetchedIdentities: DeriveAccountInfo[] | null = e.data;

      console.log(`got ${fetchedIdentities?.length ?? ''} validators identities from ${chain?.name} `);

      /** if fetched differs from saved then setIdentities and save to local storage */
      if (fetchedIdentities?.length && JSON.stringify(validatorsIdentities) !== JSON.stringify(fetchedIdentities)) {
        console.log(`setting new identities #old was: ${validatorsIdentities?.length ?? ''} `);

        setNewValidatorsIdentities(fetchedIdentities);

        window.localStorage.setItem(`${chainName}_validatorsIdentities`, JSON.stringify(fetchedIdentities));
      }

      getValidatorsIdWorker.terminate();
    };
  }, [chain?.name, chainName, validatorsIdentities]);

  useEffect(() => {
    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    endpoint && allValidatorsIds && !newValidatorsIdentities && getValidatorsIdentities(endpoint, allValidatorsIds);
  }, [endpoint, getValidatorsIdentities, allValidatorsIds, newValidatorsIdentities]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const localSavedValidatorsIdentities = window.localStorage.getItem(`${chainName}_validatorsIdentities`);

    if (localSavedValidatorsIdentities) {
      const parsedLocalSavedValidatorsIdentities = JSON.parse(localSavedValidatorsIdentities) as DeriveAccountInfo[];

      setValidatorsIdentities(parsedLocalSavedValidatorsIdentities);
    }
  }, [chainName]);

  return newValidatorsIdentities ?? validatorsIdentities;
}
