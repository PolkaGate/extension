// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDefBase } from '@polkadot/extension-inject/types';

import { selectableNetworks } from '@polkadot/networks';

import { DISABLED_NETWORKS } from './constants';

const PEOPLE_CHAIN = [
  {
    displayName: 'WestendPeople',
    genesisHash: ['0x1eb6fb0ba5187434de017a70cb84d4f47142df1d571d0ef9e7e1407f2b80b93c'],
    prefix: 42
  },
  {
    displayName: 'KusamaPeople',
    genesisHash: ['0xc1af4cb4eb3918e5db15086c0cc5ec17fb334f728b7c65dd44bfe1e174ff8b3f'],
    prefix: 2
  }
];

const hashes: MetadataDefBase[] = selectableNetworks.concat(PEOPLE_CHAIN)
  .filter(({ displayName, genesisHash }) => !!genesisHash.length && !DISABLED_NETWORKS.includes(displayName))
  .map((network) => ({
    chain: network.displayName,
    genesisHash: network.genesisHash[0],
    icon: network.icon,
    ss58Format: network.prefix
  }));

export default hashes;
