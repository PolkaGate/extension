// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const NOTIFICATION_GOVERNANCE_CHAINS = ['kusama', 'polkadot'];
export const REFERENDA_COUNT_TO_TRACK_DOT = 50;
export const REFERENDA_COUNT_TO_TRACK_KSM = 10;
export const REFERENDA_STATUS = ['ongoing', 'approved', 'timedOut', 'rejected', 'cancelled'];
export const NOTIFICATIONS_KEY = 'notifications';
export const NOTIFICATION_SETTING_KEY = 'notificationSetting';
export const NOT_READ_BGCOLOR = '#ECF6FE';
export const MAX_RETRIES = 3;
export const BATCH_SIZE = 3;
export const DEFAULT_NOTIFICATION_SETTING = {
  enable: true,
  governance: ['polkadot', 'kusama'],
  receivedFunds: true,
  stakingRewards: ['polkadot', 'kusama']
};

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
