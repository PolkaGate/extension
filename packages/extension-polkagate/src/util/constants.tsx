// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { BN } from '@polkadot/util';

export const EXTENSION_NAME = 'Polkagate';
export const NEW_VERSION_ALERT = 'alert_v0.1.5.0';
export const PREFERRED_POOL_NAME = EXTENSION_NAME;
export const DEFAULT_CHAIN_INDEX = 1;
export const DEFAULT_MAX_COMMISSION = 10;
export const DEFAULT_LIMIT_OF_VALIDATORS_PER_OPERATOR = 2;
export const MILLISECONDS_TO_UPDATE = 5 * 60 * 1000; // to update price
// export const EXTENSION_FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf2WHD0oVR0NS7tW6C1U025H1XBEZXqwxvFvPhcoFa18eHQiA/viewform';
export const BALANCES_VALIDITY_PERIOD = 5 * 60 * 1000; // to show outdated balance i grey
export const PLUS_VERSION = '0.44.1.19';
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
export const TIME_TO_SHAKE_STAKE_ICON = 5000;// msec
export const CHAINS_WITH_BLACK_LOGO = ['Centrifuge', 'Centrifuge Chain', 'Kusama', 'Kusama Relay Chain', 'Pendulum', 'Pendulum chain'];
export const CHAINS_ON_POLKAHOLIC = ['Pendulum', 'Pendulum chain', 'Amplitude', 'Amplitude chain'];
export const DISABLED_NETWORKS = ['Bittensor', '3DP network', 'xx network', 'Ajuna Network', 'Polkadex Mainnet', 'Polymesh', 'Stafi'];
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
export const TEST_NETS = [
  '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e' // Westend
];

export const CROWDLOANS_CHAINS = [
  POLKADOT_GENESIS_HASH, // POLKADOT
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe' // KUSAMA
];

export const GOVERNANCE_CHAINS = [
  POLKADOT_GENESIS_HASH, // POLKADOT
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe' // KUSAMA
];

export const SOCIAL_RECOVERY_CHAINS = [
  '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e', // WESTEND
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe' // KUSAMA
];

// used to enable/disable staking icon in account page
export const STAKING_CHAINS = [
  POLKADOT_GENESIS_HASH, // POLKADOT
  '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e', // WESTEND
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe' // KUSAMA
];

export const INITIAL_RECENT_CHAINS_GENESISHASH = [
  POLKADOT_GENESIS_HASH, // POLKADOT
  '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e', // WESTEND
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe', // KUSAMA
  '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c' // ACALA
];

// used in history to categorize transactions
export const STAKING_ACTIONS = ['Solo Staking', 'Pool Staking'];
// export const STAKING_ACTIONS = ['bond', 'unbond', 'bond_extra', 'nominate', 'redeem', 'stop_nominating', 'chill', 'tuneUp'];

// used in confirm page
export const STATES_NEEDS_MESSAGE = ['withdrawUnbound', 'unstake', 'stopNominating', 'tuneUp'];
export const CONFIRMING_STATE = ['fail', 'success', 'confirming'];

const PROXY_TYPE_POLKADOT = ['Any', 'NonTransfer', 'Staking', 'Governance', 'IdentityJudgement', 'CancelProxy', 'Auction'];
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