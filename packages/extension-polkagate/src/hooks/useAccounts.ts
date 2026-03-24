// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useMemo } from 'react';

import { AccountContext } from '../components';

type AccountsFilter = (account: AccountJson) => boolean;

/**
 * Returns the accounts from {@link AccountContext}, optionally filtered by the provided predicate.
 *
 * @param filter - Optional predicate used to include only matching accounts.
 * @returns The full account list, or a filtered subset when `filter` is provided.
 */
export default function useAccounts(filter?: AccountsFilter): AccountJson[] {
  const { accounts } = useContext(AccountContext);

  return useMemo(
    () => (filter ? accounts.filter(filter) : accounts),
    [accounts, filter]
  );
}
