// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces';
import type { SavedMetaData } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { updateMeta } from '../messaging';
import { prepareMetaData } from '../util/utils';
import { useAccount, useChain, useEndpoint2 } from '.';

/**
 * @description
 * This hooks return a list of all available validators (current and waiting) on the chain which the address is already tied with.
 */

export default function useValidatorsIdentities(address: string, allValidatorsIds: AccountId[]): DeriveAccountInfo[] | null | undefined {
  const endpoint = useEndpoint2(address);
  const account = useAccount(address);
  const chain = useChain(address);
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');
  const [validatorsIdentities, setValidatorsIdentities] = useState<DeriveAccountInfo[] | undefined>();

  const getValidatorsIdentities = useCallback((endpoint: string, validatorsAccountIds: AccountId[]) => {
    /** get validators identities */
    const getValidatorsIdWorker: Worker = new Worker(new URL('../../util/workers/getValidatorsId.js', import.meta.url));

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

        setValidatorsIdentities(fetchedIdentities);
        updateMeta(address, prepareMetaData(chain, 'validatorsIdentities', fetchedIdentities)).catch(console.error);
      }

      getValidatorsIdWorker.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain]);

  useEffect(() => {
    if (!chainName || !endpoint || !account) {
      return;
    }

    /** retrieve validatorInfo from local storage */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const savedValidatorsIdentities: SavedMetaData = account?.validatorsIdentities ? JSON.parse(account.validatorsIdentities) : null;

    if (savedValidatorsIdentities && savedValidatorsIdentities?.chainName === chainName) {
      setValidatorsIdentities(savedValidatorsIdentities.metaData as DeriveAccountInfo[]);
    }

    /** get validators info, including current and waiting, should be called after savedValidators gets value */
    endpoint && getValidatorsIdentities(endpoint, allValidatorsIds);
  }, [endpoint, account, chainName, getValidatorsIdentities, allValidatorsIds]);

  return validatorsIdentities;
}
