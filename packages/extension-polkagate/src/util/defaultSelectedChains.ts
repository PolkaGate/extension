// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

import { ACALA_GENESIS_HASH, KUSAMA_GENESIS_HASH, PASEO_ASSET_HUB_GENESIS_HASH, PASEO_GENESIS_HASH, POLKADOT_GENESIS_HASH, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, WESTEND_GENESIS_HASH, WESTMINT_GENESIS_HASH } from './constants';

export const DEFAULT_SELECTED_CHAINS: DropdownOption[] = [
  {
    text: 'Polkadot',
    value: POLKADOT_GENESIS_HASH
  },
  {
    text: 'Polkadot Asset Hub',
    value: STATEMINT_GENESIS_HASH
  },
  {
    text: 'Kusama',
    value: KUSAMA_GENESIS_HASH
  },
  {
    text: 'Kusama Asset Hub',
    value: STATEMINE_GENESIS_HASH
  },
  {
    text: 'Acala',
    value: ACALA_GENESIS_HASH
  },
  {
    text: 'Karura',
    value: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b'
  },
  {
    text: 'Astar',
    value: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6'
  },
  {
    text: 'Hydration',
    value: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d'
  },
  {
    text: 'Westend',
    value: WESTEND_GENESIS_HASH
  },
  {
    text: 'Westend Asset Hub',
    value: WESTMINT_GENESIS_HASH
  },
  {
    text: 'Paseo',
    value: PASEO_GENESIS_HASH
  },
  {
    text: 'Paseo Asset Hub',
    value: PASEO_ASSET_HUB_GENESIS_HASH
  }
];
