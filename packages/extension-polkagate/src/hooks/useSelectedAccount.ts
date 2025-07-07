// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../util';

export default function useSelectedAccount (): AccountJson | null | undefined {
  const [selected, setSelected] = useState<AccountJson | null>();

  useEffect(() => {
    let isMounted = true;

    getStorage('selectedAccount')
      .then((account) => {
        if (isMounted) {
          setSelected(account as AccountJson ?? null);
        }
      })
      .catch(console.error);

    const unsubscribe = watchStorage('selectedAccount', setSelected);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return selected;
}
