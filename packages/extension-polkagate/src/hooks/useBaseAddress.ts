// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { evmToAddress } from '@polkadot/util-crypto';

import { getSubstrateAddress } from '../util';
import useAccount from './useAccount';

export default function useBaseAddress(address: string | AccountId | null | undefined): string | undefined {
  const { type } = useAccount(address) || {};

  if (!address) {
    return;
  }

  return type === 'ethereum' ? evmToAddress(String(address)) : getSubstrateAddress(address);
}
