// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { selectableNetworks } from '@polkadot/networks';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { getSubstrateAddress } from '../util/utils';
import useChain from './useChain';

export default function useDecimal (address: AccountId | string | undefined): number | undefined {
  /** address can be a formatted address hence needs to find its substrate format first */
  const sAddr = getSubstrateAddress(address);
  const localChain = useChain(sAddr);

  const network = selectableNetworks.find((network) => network.genesisHash[0] === localChain?.genesisHash);

  return network?.decimals?.length ? network.decimals[0] : undefined;
}
