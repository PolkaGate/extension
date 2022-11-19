// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Chain } from '@polkadot/extension-chains/types';

import { getSubstrateAddress } from '../util/utils';
import { useAccount, useMetadata } from './';

export default function useChain(address: string | undefined, chain?: Chain): Chain | null {
  /** address can be a formatted address hence needs to find its substrate format first */
  const sAddr = getSubstrateAddress(address);
  const account = useAccount(sAddr);
  const localChain = useMetadata(account?.genesisHash, true);

  if (chain) {
    return chain;
  }

  return localChain;
}
