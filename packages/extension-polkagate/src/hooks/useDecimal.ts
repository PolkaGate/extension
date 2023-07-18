// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { selectableNetworks } from '@polkadot/networks';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { getSubstrateAddress } from '../util/utils';
import useChain from './useChain';

export default function useDecimal(address: AccountId | string | undefined): number | undefined {
  /** address can be a formatted address hence needs to find its substrate format first */
  const sAddr = getSubstrateAddress(address);
  const chain = useChain(sAddr);

  return useMemo(() => {
    if (!chain?.genesisHash) {
      return undefined;
    }

    const network = selectableNetworks.find((network) => network.genesisHash[0] === chain?.genesisHash);

    return network?.decimals?.length ? network.decimals[0] : undefined;
  }, [chain?.genesisHash]);
}
