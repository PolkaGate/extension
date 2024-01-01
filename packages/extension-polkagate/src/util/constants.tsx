// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { BN } from '@polkadot/util';

export const EXTENSION_NAME = 'Polkagate';
export const NEW_VERSION_ALERT = 'alert_v0.2.3';
export const PREFERRED_POOL_NAME = EXTENSION_NAME;
export const DEFAULT_CHAIN_INDEX = 1;
export const DEFAULT_MAX_COMMISSION = 10;
export const DEFAULT_LIMIT_OF_VALIDATORS_PER_OPERATOR = 2;
export const MILLISECONDS_TO_UPDATE = 5 * 60 * 1000; // to update price
// export const EXTENSION_FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf2WHD0oVR0NS7tW6C1U025H1XBEZXqwxvFvPhcoFa18eHQiA/viewform';
export const BALANCES_VALIDITY_PERIOD = 5 * 60 * 1000; // to show outdated balance i grey
export const ENVIRONMENT = 'production'; // development or production
export const PREFERRED_POOL_ID_ON_WESTEND = new BN(6);
export const PREFERRED_POOL_ID_ON_KUSAMA = undefined;
export const PREFERRED_POOL_ID_ON_POLKADOT = undefined;
export const DEVELOPMENT_ENDPOINT = 'wss://109.109.36.23:443';
export const SELECTED_COLOR = '#fffbed';
export const POLKADOT_COLOR = '#E6007A';
export const AUCTION_GRACE_PERIOD = 27000;// blocks
export const MAX_NOMINATIONS = 16;
export const FLOATING_POINT_DIGIT = 4;
export const BLOCK_RATE = 6; // sec
export const DEFAULT_TOKEN_DECIMALS = 12;
export const MIN_EXTRA_BOND = 1 / (10 ** FLOATING_POINT_DIGIT);
export const DEFAULT_COIN = 'WND';
export const DEFAULT_CHAIN_NAME = 'Westend';
export const DEFAULT_VALIDATOR_COMMISSION_FILTER = 20;
export const TRANSACTION_HISTORY_DEFAULT_ROWS = 6;
export const SHORT_ADDRESS_CHARACTERS = 4;
export const MAX_VOTES = 16;
export const MAX_REWARDS_TO_SHOW = 100;
export const MAX_HISTORY_RECORD_TO_SHOW = 40;
export const MAX_AMOUNT_LENGTH = 15;
export const TIME_TO_SHAKE_ICON = 5000;// msec
export const CHAINS_WITH_BLACK_LOGO = ['statescan', 'Centrifuge', 'Centrifuge Chain', 'Kusama', 'Kusama Relay Chain', 'Pendulum', 'Pendulum chain', 'Zeitgeist', 'Westend Collectives'];
export const CHAINS_ON_POLKAHOLIC = ['Pendulum', 'Pendulum chain', 'Amplitude', 'Amplitude chain'];
export const DISABLED_NETWORKS = ['3DP network', 'xx network', 'Polkadex Mainnet', 'Stafi'];
export const RELAY_CHAINS = [
  {
    name: 'Polkadot',
    symbol: 'DOT'
  },
  {
    name: 'Kusama',
    symbol: 'KSM'
  },
  {
    name: 'Westend',
    symbol: 'WND'
  }
];

export const POLKADOT_GENESIS_HASH = '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';
export const KUSAMA_GENESIS_HASH = '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';
export const WESTEND_GENESIS_HASH = '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e';
export const ACALA_GENESIS_HASH = '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c';

export const WESTMINT_GENESIS_HASH = '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9';
export const STATEMINE_GENESIS_HASH = '0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a'; // KUSAMA ASSET HUB
export const STATEMINT_GENESIS_HASH = '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f';

export const ASSET_HUBS = [
  WESTMINT_GENESIS_HASH,
  STATEMINE_GENESIS_HASH,
  STATEMINT_GENESIS_HASH
];

export const TEST_NETS = [
  WESTEND_GENESIS_HASH,
  WESTMINT_GENESIS_HASH
];

export const PROXY_CHAINS = [
  POLKADOT_GENESIS_HASH,
  KUSAMA_GENESIS_HASH,
  WESTEND_GENESIS_HASH
];

export const CROWDLOANS_CHAINS = [
  POLKADOT_GENESIS_HASH,
  KUSAMA_GENESIS_HASH
];

export const GOVERNANCE_CHAINS = [
  POLKADOT_GENESIS_HASH,
  KUSAMA_GENESIS_HASH,
  WESTEND_GENESIS_HASH
];

export const SOCIAL_RECOVERY_CHAINS = [
  WESTEND_GENESIS_HASH,
  KUSAMA_GENESIS_HASH
];

// used to enable/disable staking icon in account page
export const STAKING_CHAINS = [
  POLKADOT_GENESIS_HASH,
  WESTEND_GENESIS_HASH,
  KUSAMA_GENESIS_HASH
];

export const IDENTITY_CHAINS = [
  ...STAKING_CHAINS,
  '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6', // Astar
  '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b', // Bifrost
  '0xa85cfb9b9fd4d622a5b28289a02347af987d8f73fa3108450e2b4a11c1ce5755', // Basilic
  '0xb3db41421702df9a7fcac62b53ffeac85f7853cc4e689e0b93aeb3db18c09d82', // Centrifuge
  '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d', // HydraDx
  '0x742a2ca70c2fda6cee4f8df98d64c4c670a052d9568058982dad9d5a7a135c5b', // Edgeware
  '0xe61a41c53f5dcd0beb09df93b34402aada44cb05117b71059cce40a2723a4e97', // Parallel
  '0x1bb969d85965e4bb5a651abbedf21a54b6b31a21f66b5401cc3f1e286268d736', // Phala
  '0x6811a339673c9daa897944dcdac99c6e2939cc88245ed21951a0a3c9a2be75bc', // Picaso
  '0x6d8d9f145c2177fa83512492cdd80a71e29f22473f4a8943a6292149ac319fb9', // SORA
];

export const INITIAL_RECENT_CHAINS_GENESISHASH = [
  POLKADOT_GENESIS_HASH,
  WESTEND_GENESIS_HASH,
  KUSAMA_GENESIS_HASH,
  ACALA_GENESIS_HASH // ACALA
];

// used in history to categorize transactions
export const STAKING_ACTIONS = ['Solo Staking', 'Pool Staking'];
// export const STAKING_ACTIONS = ['bond', 'unbond', 'bond_extra', 'nominate', 'redeem', 'stop_nominating', 'chill', 'tuneUp'];

// used in confirm page
export const STATES_NEEDS_MESSAGE = ['withdrawUnbound', 'unstake', 'stopNominating', 'tuneUp'];
export const CONFIRMING_STATE = ['fail', 'success', 'confirming'];

const PROXY_TYPE_POLKADOT = ['Any', 'NonTransfer', 'Staking', 'Governance', 'IdentityJudgement', 'CancelProxy', 'Auction', 'NominationPools'];
const PROXY_TYPE_KUSAMA = ['Any', 'NonTransfer', 'Staking', 'Society', 'Governance', 'IdentityJudgement', 'CancelProxy', 'Auction', 'NominationPools'];
const PROXY_TYPE_WESTEND = ['Any', 'NonTransfer', 'Staking', 'SudoBalances', 'IdentityJudgement', 'CancelProxy', 'Auction', 'NominationPools'];

export const CHAIN_PROXY_TYPES = { Kusama: PROXY_TYPE_KUSAMA, Polkadot: PROXY_TYPE_POLKADOT, Westend: PROXY_TYPE_WESTEND };

export const DEFAULT_IDENTITY = {
  // 'judgments': [],
  //  'deposit':202580000000,
  info: {
    // 'additional':[],
    display: null,
    legal: null,
    web: null,
    //  'riot':{'none':null},
    email: null,
    //  'pgpFingerprint':null,
    //  'image':{'none':null},
    twitter: null
  }
};

export const VOTE_MAP = {
  AYE: 1,
  NAY: 0
};

export const PASS_MAP = {
  EMPTY: 0,
  INCORRECT: -1,
  // eslint-disable-next-line sort-keys
  CORRECT: 1
};

// export const DATE_OPTIONS = { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
export const DATE_OPTIONS = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };

export const DEFAULT_FILTERS = {
  limitOfValidatorsPerOperator: { check: false, value: 2 },
  maxCommission: { check: false, value: 30 },
  noOversubscribed: false,
  noSlashed: false,
  noWaiting: false,
  sortBy: 'None (Default)',
  withIdentity: false
};

export const DEFAULT_POOL_FILTERS = {
  hasNominated: { check: false, value: 10 },
  hasVerifiedIdentity: false,
  membersMoreThan: { check: false, value: 100 },
  sortBy: 'Index (Default)',
  stakedMoreThan: { check: false, value: 200 } // TOKEN
};

export const TOTAL_STAKE_HELPER_TEXT = 'Your total amount of stake after completing this transaction.';
export const SYSTEM_SUGGESTION_TEXT = 'Our system suggests trusted, high return, low commission validators. Polkagate assumes no responsibility or liability for any misconduct resulting from the future actions of the validators.'// which not slashed before.' //TODO: add a disclaimer to the text too

export const REGISTRARS_LIST: { addresses: string[]; index: number; name: string }[] = [
  {
    addresses: ['Fom9M5W6Kck1hNAiE2mDcZ67auUCiNTzLBUdQy4QnxHSxdn', '1Reg2TYv9rGfrQKpPREmrHRxrNsUDBQKzkYwP1UstD97wpJ', '5HREGY2fxewHiHRPBUQ6xpcCWRruvyq9igNvRYnxSr1vAWGE'],
    index: 1,
    name: 'Chevdor'
  },
  {
    addresses: ['GhmpzxUyTVsFJhV7s2wNvD8v3Bgikb6WvYjj4QSuSScAUw6'],
    index: 4,
    name: 'Litentry'
  },
  {
    addresses: ['H4XieK3r3dq3VEvRtqZR7wN7a1UEkXxf14orRsEfdFjmgkF', '12j3Cz8qskCGJxmSJpVL2z2t3Fpmw3KoBaBaRGPnuibFc7o8'],
    index: 0,
    name: 'Web3Foundation'
  }
];

/** Login Password constants */
export const NO_PASS_PERIOD = 30 * 60 * 1000; // in ms, the duration of time we do not ask user for password after a successful login
export const MAYBE_LATER_PERIOD = 5000; // ms
