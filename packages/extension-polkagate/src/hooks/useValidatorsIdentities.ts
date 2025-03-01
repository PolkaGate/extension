// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { SavedValidatorsIdentities, ValidatorsIdentities } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { useCurrentEraIndex, useInfo, usePeopleChain } from '.';
import { AUTO_MODE } from '../util/constants';

export default function useValidatorsIdentities(address: string | undefined, allValidatorsIds: AccountId[] | null | undefined, identities?: DeriveAccountInfo[] | null): DeriveAccountInfo[] | null | undefined {
  const { chainName } = useInfo(address);
  const { endpoint } = usePeopleChain(address);

  const currentEraIndex = useCurrentEraIndex(address);

  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | null | undefined>();
  const [newValidatorsIdentities, setNewValidatorsIdentities] = useState<DeriveAccountInfo[] | null | undefined>();
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
        console.log(`setting new identities #old was: ${validatorsIdentities?.length || '0'}`);

        setNewValidatorsIdentities(identities);

        chrome.storage.local.get('validatorsIdentities', (res) => {
          const k = `${chainName}`;
          const last = res?.['validatorsIdentities'] as Record<string, unknown> ?? {};

          last[k] = info;
          // eslint-disable-next-line no-void
          void chrome.storage.local.set({ validatorsIdentities: last });
        });
      }

      getValidatorsIdWorker.terminate();
    };
  }, [chainName, savedEraIndex, validatorsIdentities?.length]);

  useEffect(() => {
    if (identities) {
      setNewValidatorsIdentities(identities);

      return;
    }

    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    endpoint && endpoint !== AUTO_MODE.value && allValidatorsIds && !newValidatorsIdentities && currentEraIndex && currentEraIndex !== savedEraIndex && getValidatorsIdentities(endpoint, allValidatorsIds);
  }, [endpoint, getValidatorsIdentities, allValidatorsIds, newValidatorsIdentities, currentEraIndex, savedEraIndex, identities]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    // eslint-disable-next-line no-void
    void chrome.storage.local.get('validatorsIdentities', (res: Record<string, SavedValidatorsIdentities>) => {
      if (res?.['validatorsIdentities']?.[chainName]) {
        setValidatorsIdentities(res['validatorsIdentities'][chainName]?.accountsInfo);
        setSavedEraIndex(res['validatorsIdentities'][chainName]?.eraIndex);
      }
    });
  }, [chainName]);

  return newValidatorsIdentities || validatorsIdentities;
}
