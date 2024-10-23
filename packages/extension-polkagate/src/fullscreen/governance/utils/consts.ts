// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN } from '@polkadot/util';

export const MAX_WIDTH = '1280px';
export const LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST = 50;
export const TRACK_LIMIT_TO_LOAD_PER_REQUEST = LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST;
export const REFERENDA_LIMIT_SAVED_LOCAL = 2 * LATEST_REFERENDA_LIMIT_TO_LOAD_PER_REQUEST;

export const FINISHED_REFERENDUM_STATUSES = ['Cancelled', 'Confirmed', 'Executed', 'Rejected', 'TimedOut'];

export const REFERENDA_STATUS = [
  ['All'],
  ['Cancelled'],
  ['Confirmed'],
  ['Deciding'],
  ['Confirming', 'ConfirmStarted'],
  ['ConfirmAborted'],
  ['Executed'],
  ['Rejected'],
  ['Submitted'],
  ['TimedOut']
];

export const STATUS_COLOR: Record<string, string> = {
  Awarded: '#32CD32',
  Cancelled: '#737373',
  ConfirmAborted: '#FF9999',
  ConfirmStarted: '#FFB900',
  Confirmed: '#008080',
  Deciding: '#6A5ACD',
  DecisionDepositPlaced: '#FFA07A',
  Executed: '#00BFFF',
  ExecutionFailed: '#FF0000',
  Rejected: '#FF5722',
  Submitted: '#6B9090',
  TimedOut: '#AD9C88',
  ToBeAwarded: '#FFA500'
};

export const ENDED_STATUSES = ['Executed', 'Rejected', 'TimedOut', 'TimeOut', 'Confirmed', 'Cancelled'];
export const TREASURY_TRACKS = ['treasurer', 'small_tipper', 'big_tipper', 'small_spender', 'medium_spender', 'big_spender'];
export const CONVICTIONS = [1, 2, 4, 8, 16, 32].map((lock, index): [value: number, duration: number, durationBn: BN] => [index + 1, lock, new BN(lock)]);
