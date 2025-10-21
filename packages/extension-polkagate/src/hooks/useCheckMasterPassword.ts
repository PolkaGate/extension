// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useEffect, useState } from 'react';

import { accountsValidate } from '../messaging';
import useLocalAccounts from './useLocalAccounts';

async function getAccountsNeedsMigration (localAccounts: AccountJson[], password: string): Promise<AccountJson[]> {
  const results = await Promise.all(localAccounts.map(async (account) => {
    const isValidPass = await accountsValidate(account.address, password);

    return isValidPass ? undefined : account;
  }));

  return results.filter((a): a is AccountJson => Boolean(a));
}

export default function useCheckMasterPassword (pass: string | undefined): {
  accountsNeedMigration: AccountJson[] | undefined,
  hasLocalAccounts: boolean
} {
  const localAccounts = useLocalAccounts();

  const [accountsNeedMigration, setAccountsNeedMigration] = useState<AccountJson[]>();

  useEffect(() => {
    if (!pass) {
      return;
    }

    setAccountsNeedMigration(undefined);

    getAccountsNeedsMigration(localAccounts, pass)
      .then(setAccountsNeedMigration)
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAccounts?.length, pass]);

  return {
    accountsNeedMigration,
    hasLocalAccounts: !!localAccounts.length
  };
}
