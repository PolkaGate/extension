// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';
import { getStorage, watchStorage } from '../util';
import { SELECTED_ACCOUNT_IN_STORAGE } from '../util/constants';
import { getSubstrateAddress } from '../util/utils';

export default function useSelectedAccount (): AccountJson | null | undefined {
  const [selected, setSelected] = useState<AccountJson | null>();
  const { accounts } = useContext(AccountContext);

  const handleSetAccount = useCallback((address: string | object) => {
    let found;

    if (address) {
      const savedAddress = getSubstrateAddress(address as string);

      found = accounts.find(({ address }) => address === savedAddress);
    }

    setSelected(found ?? accounts?.[0] ?? null);
  }, [accounts]);

  useEffect(() => {
    let isMounted = true;

    getStorage(SELECTED_ACCOUNT_IN_STORAGE)
      .then((address) => {
        if (isMounted) {
          handleSetAccount(address);
        }
      })
      .catch(console.error);

    const unsubscribe = watchStorage(SELECTED_ACCOUNT_IN_STORAGE, handleSetAccount);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [accounts, handleSetAccount]);

  return selected;
}
