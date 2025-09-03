// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { getSubstrateAddress } from '../util/utils';
import useAccount from './useAccount';

export default function useAccountName (address: string | AccountId | undefined): string | undefined {
  const substrateAddress = getSubstrateAddress(address);
  const account = useAccount(substrateAddress);

  return useMemo((): string | undefined =>
    account?.name
      ? account.name
      : undefined
  , [account?.name]);
}
