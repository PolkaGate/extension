// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';

import { useCallback, useContext, useMemo } from 'react';

import { AccountContext } from '../components';

export default function useAccountsOrder (): AccountJson[] | undefined {
  const { hierarchy } = useContext(AccountContext);

  const flattenHierarchy = useCallback((account: AccountWithChildren): AccountWithChildren[] => {
    return [account, ...(account.children || []).flatMap(flattenHierarchy)];
  }, []);

  return useMemo(() => hierarchy.flatMap(flattenHierarchy), [flattenHierarchy, hierarchy]);
}
