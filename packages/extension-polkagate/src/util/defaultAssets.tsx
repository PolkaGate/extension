// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { ACALA_GENESIS_HASH, KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, WESTEND_GENESIS_HASH, WESTMINT_GENESIS_HASH } from './constants';
import { DropdownOption } from './types';

type assetType = {
  genesisHash: string;
  name: string;
  priceId: string;
  token?: string;
  decimal?: number;
  assetId?: number;
};

type CurrencyItem = {
  code: string;
  country: string;
  currency: string;
  sign: string;
  side: 'right' | 'left';
}

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
    text: 'HydraDX',
    value: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d'
  },
  {
    text: 'Westend',
    value: WESTEND_GENESIS_HASH
  },
  {
    text: 'Westend Asset Hub',
    value: WESTMINT_GENESIS_HASH
  }
];

export const DEFAULT_ASSETS: assetType[] = [{
  genesisHash: POLKADOT_GENESIS_HASH,
  name: 'Polkadot',
  priceId: 'polkadot',
  token: 'DOT'
},
{
  genesisHash: KUSAMA_GENESIS_HASH,
  name: 'Kusama',
  priceId: 'kusama',
  token: 'KSM'
},
{
  genesisHash: ACALA_GENESIS_HASH,
  name: 'Acala',
  priceId: 'acala',
  token: 'ACA'
},
{
  genesisHash: ACALA_GENESIS_HASH,
  name: 'Liquid Staking Dot',
  priceId: 'liquid-staking-dot',
  token: 'LDOT'
},
{
  decimal: 10,
  genesisHash: ACALA_GENESIS_HASH,
  name: 'Polkadot',
  priceId: 'polkadot',
  token: 'DOT'
},
{
  genesisHash: ACALA_GENESIS_HASH,
  name: 'Acala Dollar',
  priceId: 'acala-dollar-acala',
  token: 'AUSD'
},
{
  genesisHash: WESTEND_GENESIS_HASH,
  name: 'Westend',
  priceId: ''
},
{
  genesisHash: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
  name: 'Astar',
  priceId: 'astar'
},
{
  genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
  name: 'HydraDX',
  priceId: 'hydradx'
},
{
  genesisHash: '0xbaf5aabe40646d11f0ee8abbdc64f4a4b7674925cba08e4a05ff9ebed6e2126b',
  name: 'Karura',
  priceId: 'karura'
},
{
  genesisHash: WESTMINT_GENESIS_HASH,
  name: 'WestendAssetHub',
  priceId: ''
},
{
  assetId: 14,
  genesisHash: STATEMINE_GENESIS_HASH,
  name: 'Polkadot',
  priceId: 'polkadot'
},
{
  assetId: 1984,
  genesisHash: STATEMINE_GENESIS_HASH,
  name: 'Tether USD',
  priceId: 'tether'
},
{
  assetId: 1984,
  genesisHash: STATEMINT_GENESIS_HASH,
  name: 'Tether USD',
  priceId: 'tether'
},
{
  assetId: 1337,
  genesisHash: STATEMINT_GENESIS_HASH,
  name: 'USD Coin',
  priceId: 'usd-coin'
}
];
