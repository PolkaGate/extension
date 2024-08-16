// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useChain } from '.';

export default function useGenesisHash(address: AccountId | string | undefined, _genesisHash?: string): string | undefined {
  const chain = useChain(address);

  return _genesisHash || chain?.genesisHash;
}
