// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountContext } from '../components';
import { getSubstrateAddress } from '../util/utils';

function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | undefined {
  return accounts.find(({ address }): boolean =>
    address === _address
  ) || undefined;
}

export default function useAccountName(address: string | AccountId | undefined): string | undefined {
  const [name, setName] = useState<string | undefined>();
  const { accounts } = useContext(AccountContext);

  useEffect((): void => {
    if (!address) {
      return undefined;
    }

    /** address can be a formatted address hence needs to find its substrate format first */
    const sAddr = getSubstrateAddress(address);

    if (!sAddr) {
      return undefined;
    }

    const acc = findAccountByAddress(accounts, sAddr);

    setName(acc?.name);
  }, [accounts, address]);

  return name;
}
