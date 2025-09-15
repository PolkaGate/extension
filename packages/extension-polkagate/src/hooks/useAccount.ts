// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useContext, useMemo } from 'react';

import { AccountContext } from '../components';
import { getSubstrateAddress } from '../util/utils';

export default function useAccount (address: string | AccountId | null | undefined): AccountJson | undefined {
  const { accounts } = useContext(AccountContext);

return useMemo(() => {
    if (!address) {
      return undefined;
    }

    const substrateAddress = getSubstrateAddress(address);

    if (!substrateAddress) {
      return undefined;
    }

    return accounts.find((acc) => acc.address === substrateAddress);
  }, [accounts, address]);
}
