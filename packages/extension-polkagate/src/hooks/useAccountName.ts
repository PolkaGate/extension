// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useEffect, useState } from 'react';

import { AccountContext } from '../components';

function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | undefined {
  return accounts.find(({ address }): boolean =>
    address === _address
  ) || undefined;
}

export default function useAccountName(address: string | undefined): string | undefined {
  const [name, setName] = useState<string | undefined>();
  const { accounts } = useContext(AccountContext);

  useEffect((): void => {
    if (!address) {
      setName(undefined);
    }

    const acc = findAccountByAddress(accounts, address);

    setName(acc?.name);
  }, [accounts, address]);

  return name;
}
