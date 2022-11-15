// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chain } from '@polkadot/extension-chains/types';

import { useAccount, useMetadata } from './';

export default function useChain(address: string | undefined, chain?: Chain): Chain | null {
  const account = useAccount(address);
  const localChain = useMetadata(account?.genesisHash, true);

  if (chain) {
    return chain;
  }

  return localChain;
}
