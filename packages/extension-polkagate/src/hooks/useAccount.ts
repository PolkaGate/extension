// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { getSubstrateAddress } from '../util';
import useAccounts from './useAccounts';

export default function useAccount(address: string | AccountId | null | undefined): AccountJson | undefined {
  const accounts = useAccounts();

  return useMemo(() => {
    if (!address) {
      return undefined;
    }

    const normalizedAddress = isEthereumAddress(String(address))
      ? String(address)
      : getSubstrateAddress(address);

    if (!normalizedAddress) {
      return undefined;
    }

    return accounts.find(({ address }) => address.toLowerCase() === normalizedAddress.toLowerCase());
  }, [accounts, address]);
}