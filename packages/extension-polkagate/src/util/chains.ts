// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDefBase } from '@polkadot/extension-inject/types';

import { selectableNetworks } from '@polkadot/networks';

import { DISABLED_NETWORKS } from './constants';

const hashes: MetadataDefBase[] = selectableNetworks
  .filter(({ displayName, genesisHash }) => !!genesisHash.length && !DISABLED_NETWORKS.includes(displayName))
  .map((network) => ({
    chain: network.displayName,
    genesisHash: network.genesisHash[0],
    icon: network.icon,
    ss58Format: network.prefix
  }));

export default hashes;
