// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from '@polkadot/networks/types';
import type { HexString } from '@polkadot/util/types';

import { selectableNetworks } from '@polkagate/apps-config';

import { DISABLED_NETWORKS } from './constants';

export interface NetworkInfo{
  chain: string;
  genesisHash: HexString;
  icon: Icon;
  isTestnet?: boolean;
  name: string;
  ss58Format: number;
  tokenDecimal: number;
  tokenSymbol: string;
}

const hashes = selectableNetworks
  .filter(({ displayName, genesisHash }) => !!genesisHash.length && !DISABLED_NETWORKS.includes(displayName))
  .map((network) => ({
    chain: network.displayName,
    genesisHash: network.genesisHash[0],
    icon: network.icon,
    isTestnet: network.isTestnet,
    name: network.displayName,
    ss58Format: network.prefix,
    tokenDecimal: network.decimals[0],
    tokenSymbol: network.symbols[0]
  } as NetworkInfo));

export default hashes;
