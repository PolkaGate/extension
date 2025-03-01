// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { useMemo } from 'react';

import { selectableNetworks } from '@polkadot/networks';

import { getSubstrateAddress } from '../util/utils';
import useChain from './useChain';

export default function useToken(address: AccountId | string | undefined): string | undefined {
  /** address can be a formatted address hence needs to find its substrate format first */
  const sAddr = getSubstrateAddress(address);
  const chain = useChain(sAddr);

  return useMemo(() => {
    if (!chain?.genesisHash) {
      return undefined;
    }

    const network = selectableNetworks.find((network) => network.genesisHash[0] === chain.genesisHash);

    return network?.symbols?.length ? network.symbols[0] : chain.tokenSymbol;
  }, [chain?.genesisHash, chain?.tokenSymbol]);
}
