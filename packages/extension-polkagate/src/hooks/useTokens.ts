// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { DropdownOption } from '../util/types';

import { selectableNetworks } from '@polkadot/networks';

import { getSubstrateAddress } from '../util/utils';
import useAccount from './useAccount';

export default function useTokens(address: AccountId | string | undefined): DropdownOption[] | undefined {
  /** address can be a formatted address hence needs to find its substrate format first */
  const sAddr = getSubstrateAddress(address);
  const account = useAccount(sAddr);

  const network = selectableNetworks.find((network) => network.genesisHash[0] === account?.genesisHash);

  return network?.symbols?.length
    ? network.symbols.map((symbol, index) => {
      return { text: symbol, value: index - (network.symbols.length) }; // The native tokens asset ids to show in drop down are negative, such as -1, -2, etc.
    })
    : undefined;
}
