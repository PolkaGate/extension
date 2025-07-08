// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from '@polkadot/networks/types';

import { selectableNetworks } from '@polkadot/networks';

import { DISABLED_NETWORKS } from './constants';

export interface NetworkInfo{
  chain: string;
  genesisHash: string;
  icon: Icon;
  name: string;
  ss58Format: number;
  tokenDecimal: number;
  tokenSymbol: string;
}

const hashes: NetworkInfo[] = selectableNetworks
  .filter(({ displayName, genesisHash }) => !!genesisHash.length && !DISABLED_NETWORKS.includes(displayName))
  .map((network) => ({
    chain: network.displayName,
    genesisHash: network.genesisHash[0],
    icon: network.icon,
    name: network.displayName,
    ss58Format: network.prefix,
    tokenDecimal: network.decimals[0],
    tokenSymbol: network.symbols[0]
  }));

export default hashes;
