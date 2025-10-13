// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';
import { accountsValidate } from '../messaging';

async function getAccountsNeedsMigration (accounts: AccountJson[], password: string): Promise<AccountJson[]> {
  const nonExternalAccount = accounts.filter(({ isExternal }) => !isExternal);

  const results = await Promise.all(nonExternalAccount.map(async (account) => {
    const { address, isExternal } = account;

    if (isExternal) {
      return;
    }

    const isValidPass = await accountsValidate(address, password);

    return isValidPass ? undefined : account;
  }));

  return results.filter((a): a is AccountJson => Boolean(a));
}

export default function useCheckMasterPassword (pass: string | undefined): AccountJson[] | undefined {
  const { accounts } = useContext(AccountContext);
  const [accountsNeedsMigration, setAccounts] = useState<AccountJson[]>();

  useEffect(() => {
    if (!pass) {
      return;
    }

    getAccountsNeedsMigration(accounts, pass).then((res) => {
      setAccounts(res);
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length, pass]);

  return accountsNeedsMigration;
}
