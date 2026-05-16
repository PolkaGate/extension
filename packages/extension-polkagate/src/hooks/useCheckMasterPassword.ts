// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useEffect, useState } from 'react';

import { accountsValidate } from '../messaging';
import useLocalAccounts from './useLocalAccounts';

async function checkAccountsPassword(localAccounts: AccountJson[], password: string): Promise<{ accountsNeedMigration: AccountJson[], matchedAccountsCount: number }> {
  const results = await Promise.all(localAccounts.map(async (account) => {
    const isValidPass = await accountsValidate(account.address, password);

    return { account, isValidPass };
  }));

  return {
    accountsNeedMigration: results.filter(({ isValidPass }) => !isValidPass).map(({ account }) => account),
    matchedAccountsCount: results.filter(({ isValidPass }) => isValidPass).length
  };
}

export default function useCheckMasterPassword(pass: string | undefined): {
  accountsNeedMigration: AccountJson[] | undefined,
  hasLocalAccounts: boolean,
  matchedAccountsCount: number | undefined
} {
  const localAccounts = useLocalAccounts();

  const [accountsNeedMigration, setAccountsNeedMigration] = useState<AccountJson[]>();
  const [matchedAccountsCount, setMatchedAccountsCount] = useState<number>();

  useEffect(() => {
    if (!pass) {
      return;
    }

    setAccountsNeedMigration(undefined);
    setMatchedAccountsCount(undefined);

    checkAccountsPassword(localAccounts, pass)
      .then(({ accountsNeedMigration, matchedAccountsCount }) => {
        setAccountsNeedMigration(accountsNeedMigration);
        setMatchedAccountsCount(matchedAccountsCount);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAccounts?.length, pass]);

  return {
    accountsNeedMigration,
    hasLocalAccounts: !!localAccounts.length,
    matchedAccountsCount
  };
}
