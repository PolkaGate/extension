// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountContext } from '../components';
import { getSubstrateAddress } from '../util/utils';

function findAccountByAddress (accounts: AccountJson[], address: string): AccountJson | undefined {
  return accounts.find((acc) => acc.address === address);
}

export default function useAccount(address: string | AccountId | null | undefined): AccountJson | undefined {
  const [account, setAccount] = useState<AccountJson>();

  const { accounts } = useContext(AccountContext);

  useEffect(() => {
    if (!address) {
      setAccount(undefined);

      return;
    }

    const substrateAddress = getSubstrateAddress(address);

    if (!substrateAddress) {
      return;
    }

    const acc = findAccountByAddress(accounts, substrateAddress);

    setAccount(acc);
  }, [accounts, address]);

  return account;
}
