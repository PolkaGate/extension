// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { ACALA_GENESIS_HASH, KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, WESTEND_GENESIS_HASH, WESTMINT_GENESIS_HASH } from './constants';

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

export const DEFAULT_ASSETS: assetType[] = [{
  genesisHash: POLKADOT_GENESIS_HASH,
  name: 'Polkadot',
  priceId: 'polkadot'
},
{
  genesisHash: KUSAMA_GENESIS_HASH,
  name: 'Kusama',
  priceId: 'kusama'
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

export const currencyList = [
  {
    code: 'USD',
    country: 'United States',
    currency: 'Dollar',
    sign: '$'
  },
  {
    code: 'AED',
    country: 'Emirates',
    currency: 'Dirham',
    sign: 'AED'
  },
  {
    code: 'ARS',
    country: 'Argentina',
    currency: 'Peso',
    sign: 'ARS'
  },
  {
    code: 'AUD',
    country: 'Australia',
    currency: 'Australian dollar',
    sign: 'A$'
  },
  {
    code: 'BDT',
    country: 'Bangladesh',
    currency: 'Taka',
    sign: '৳'
  },
  {
    code: 'BHD',
    country: 'Bahrein',
    currency: 'Dinar',
    sign: 'BD'
  },
  {
    code: 'BMD',
    country: 'Bermuda',
    currency: 'Bermuda Dollar',
    sign: '$'
  },
  {
    code: 'BRL',
    country: 'Brazil',
    currency: 'Real',
    sign: 'R$'
  },
  {
    code: 'CAD',
    country: 'Canada',
    currency: 'Dollar',
    sign: 'CA$'
  },
  {
    code: 'CHF',
    country: 'Swiss',
    currency: 'Franc',
    sign: 'Fr.'
  },
  {
    code: 'CLP',
    country: 'Chile',
    currency: 'Peso',
    sign: 'CLP$'
  },
  {
    code: 'CNY',
    country: 'China',
    currency: 'Yuan',
    sign: '¥'
  },
  {
    code: 'CNY',
    country: 'Czech',
    currency: 'Koruna',
    sign: 'CZK'
  },
  {
    code: 'DKK',
    country: 'Denmark',
    currency: 'Krone',
    sign: 'kr.'
  },
  {
    code: 'EUR',
    country: 'European Union',
    currency: 'Euro',
    sign: '€'
  },
  {
    code: 'GBP',
    country: 'Great British',
    currency: 'Pound',
    sign: '£'
  },
  {
    code: 'GEL',
    country: 'Georgia',
    currency: 'Lari',
    sign: '₾'
  },
  {
    code: 'HKD',
    country: 'Hong Kong',
    currency: 'Dollar',
    sign: '$'
  },
  {
    code: 'HUF',
    country: 'Hungary',
    currency: 'Forint',
    sign: 'Ft'
  },
  {
    code: 'IDR',
    country: 'Indonesia',
    currency: 'Rupiah',
    sign: 'Rp'
  },
  {
    code: 'ILS',
    country: 'Israeli',
    currency: 'shekel',
    sign: '₪'
  },
  {
    code: 'INR',
    country: 'India',
    currency: 'Rupee',
    sign: '₹'
  },
  {
    code: 'JPY',
    country: 'Japan',
    currency: 'Yen',
    sign: '¥'
  },
  {
    code: 'KRW',
    country: 'South Korea',
    currency: 'Won',
    sign: '₩'
  },
  {
    code: 'KWD',
    country: 'Kuwait',
    currency: 'Dinar',
    sign: 'KD'
  },
  {
    code: 'LKR',
    country: 'Sri Lanka',
    currency: 'Rupee',
    sign: 'Rs'
  },
  {
    code: 'MMK',
    country: 'Myanmar',
    currency: 'Kyat',
    sign: 'K'
  },
  {
    code: 'MXN',
    country: 'Mexico',
    currency: 'Peso',
    sign: 'MX$'
  },
  {
    code: 'MYR',
    country: 'Malaysia',
    currency: 'Ringgit',
    sign: 'RM'
  },
  {
    code: 'NGN',
    country: 'Nigeria',
    currency: 'Naira',
    sign: '₦'
  },
  {
    code: 'NOK',
    country: 'Norway',
    currency: 'Krone',
    sign: 'kr'
  },
  {
    code: 'NZD',
    country: 'New Zealand',
    currency: 'Dollar',
    sign: 'NZ$'
  },
  {
    code: 'PHP',
    country: 'Philippines',
    currency: 'peso',
    sign: '₱'
  },
  {
    code: 'PKR',
    country: 'Pakistan',
    currency: 'Rupee',
    sign: 'Rs'
  },
  {
    code: 'PLN',
    country: 'Poland',
    currency: 'złoty',
    sign: 'zł'
  },
  {
    code: 'RUB',
    country: 'Russia',
    currency: 'Ruble',
    sign: '₽'
  },
  {
    code: 'SAR',
    country: 'Saudi Arabia',
    currency: 'Riyal',
    sign: 'SR'
  },
  {
    code: 'SEK',
    country: 'Sweden',
    currency: 'Krona',
    sign: 'kr'
  },
  {
    code: 'SGD',
    country: 'Singapore',
    currency: 'Dollar',
    sign: 'S$'
  },
  {
    code: 'THB',
    country: 'Thailand',
    currency: 'Baht',
    sign: '฿'
  },
  {
    code: 'TRY',
    country: 'Turkey',
    currency: 'lira',
    sign: '₺'
  },
  {
    code: 'TWD',
    country: 'Taiwan',
    currency: 'Dollar',
    sign: 'NT$'
  },
  {
    code: 'UAH',
    country: 'Ukraine',
    currency: 'hryvnia',
    sign: '₴'
  },
  {
    code: 'VEF',
    country: 'Venezuela',
    currency: 'Bolívar',
    sign: 'Bs.F'
  },
  {
    code: 'VND',
    country: 'Vietnam',
    currency: 'Dong',
    sign: '₫'
  },
  {
    code: 'ZAR',
    country: 'South Africa',
    currency: 'Rand',
    sign: 'R'
  }
];
