// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountContext } from '../components';
import { getSubstrateAddress } from '../util/utils';

function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | undefined {
  return accounts.find(({ address }) =>
    address === _address
  ) || undefined;
}

export default function useAccount(address: string | AccountId | null | undefined): AccountJson | undefined {
  const [account, setAccount] = useState<AccountJson | undefined>();
  const { accounts } = useContext(AccountContext);

  useEffect((): void => {
    if (!address) {
      setAccount(undefined);
    }

    /** address can be a formatted address hence needs to find its substrate format first */
    const sAddr = getSubstrateAddress(address);

    if (!sAddr) {
      return undefined;
    }

    const acc = findAccountByAddress(accounts, sAddr);

    setAccount(acc);
  }, [accounts, address]);

  return account;
}
