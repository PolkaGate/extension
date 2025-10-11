// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KUSAMA_GENESIS_HASH, PASEO_GENESIS_HASH, POLKADOT_GENESIS_HASH, WESTEND_GENESIS_HASH } from '../../util/constants';

export type ReferendaStatus = 'ongoing' | 'approved' | 'timedOut' | 'rejected' | 'cancelled';

export const NOTIFICATION_GOVERNANCE_CHAINS = ['kusama', 'polkadot'];

export const REFERENDA_COUNT_TO_TRACK_DOT = 50;
export const REFERENDA_COUNT_TO_TRACK_KSM = 10;
export const REFERENDA_STATUS = ['ongoing', 'approved', 'timedOut', 'rejected', 'cancelled'];

export const NOT_READ_BGCOLOR = '#ECF6FE';
export const READ_BGCOLOR = '#f0e6ea';
export const MAX_RETRIES = 5;
export const BATCH_SIZE = 2;

export const MAX_ACCOUNT_COUNT_NOTIFICATION = 3;

export const POLKADOT_NOTIFICATION_CHAIN = { text: 'Polkadot Relay Chain', value: POLKADOT_GENESIS_HASH };
export const KUSAMA_NOTIFICATION_CHAIN = { text: 'Kusama Relay Chain', value: KUSAMA_GENESIS_HASH };
export const WESTEND_NOTIFICATION_CHAIN = { text: 'Westend Relay Chain', value: WESTEND_GENESIS_HASH };
export const PASEO_NOTIFICATION_CHAIN = { text: 'Paseo Relay Chain', value: PASEO_GENESIS_HASH };

export const DEFAULT_SUPPORTED_CHAINS = [POLKADOT_NOTIFICATION_CHAIN.value, KUSAMA_NOTIFICATION_CHAIN.value];
export const SUPPORTED_CHAINS = [POLKADOT_NOTIFICATION_CHAIN, KUSAMA_NOTIFICATION_CHAIN, WESTEND_NOTIFICATION_CHAIN, PASEO_NOTIFICATION_CHAIN];

export const DEFAULT_NOTIFICATION_SETTING = {
  accounts: [],
  enable: true,
  governance: DEFAULT_SUPPORTED_CHAINS,
  receivedFunds: true,
  stakingRewards: DEFAULT_SUPPORTED_CHAINS
};

export const SUPPORTED_GOVERNANCE_NOTIFICATION_CHAIN = SUPPORTED_CHAINS;
export const SUPPORTED_STAKING_NOTIFICATION_CHAIN = SUPPORTED_CHAINS;

export const SUBSCAN_SUPPORTED_CHAINS = [
  'Polkadot',
  'Kusama',
  'PolkadotAssethub',
  'KusamaAssethub',
  'WestendAssethub',
  'PaseoAssethub',
  'Acala',
  'Ajuna',
  'Astar',
  'Basilisk',
  'Bifrost',
  'Calamari',
  'Centrifuge',
  'Composable',
  'Darwinia',
  'HydraDX',
  'IntegriTEE',
  'Karura',
  'Nodle',
  'Paseo',
  'Phala',
  'Picasso',
  'Polymesh',
  'SORA',
  'Vara',
  'Westend',
  'Zeitgeist'
];
