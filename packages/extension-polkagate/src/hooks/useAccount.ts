// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useContext, useMemo } from 'react';

import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';

import { AccountContext } from '../components';
import { getSubstrateAddress } from '../util';

export default function useAccount(address: string | AccountId | null | undefined): AccountJson | undefined {
  const { accounts } = useContext(AccountContext);

  return useMemo(() => {
    if (!address) {
      return undefined;
    }

    const baseAddress = isEthereumAddress(String(address))
      ? evmToAddress(address)
      : getSubstrateAddress(address);

    if (!baseAddress) {
      return undefined;
    }

    return accounts.find((acc) => acc.address === baseAddress);
  }, [accounts, address]);
}
