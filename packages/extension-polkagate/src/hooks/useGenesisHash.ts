// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { useChain } from '.';

export default function useGenesisHash (address: AccountId | string | undefined): string | undefined {
  const chain = useChain(address);

  return chain?.genesisHash;
}
