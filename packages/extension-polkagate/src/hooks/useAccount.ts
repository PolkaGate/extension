// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';

function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | undefined {
  return accounts.find(({ address }) =>
    address === _address
  ) || undefined;
}

export default function useAccount(address: string | undefined): AccountJson | undefined {
  const [account, setAccount] = useState<AccountJson | undefined>();
  const { accounts } = useContext(AccountContext);

  useEffect((): void => {
    if (!address) {
      setAccount(undefined);
    }

    const acc = findAccountByAddress(accounts, address);

    setAccount(acc);
  }, [accounts, address]);

  return account;
}
