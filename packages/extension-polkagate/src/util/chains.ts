// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { selectableNetworks } from '@polkadot/networks';

import { DISABLED_NETWORKS } from './constants';

const hashes = selectableNetworks
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
