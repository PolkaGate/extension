// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN } from '@polkadot/util';

export const MAX_WIDTH = '1280px';

export const STATUS_COLOR = {
  Awarded: '#32CD32',
  Cancelled: '#737373',
  ConfirmStarted: '#FFB900',
  Confirmed: '#008080',
  Deciding: '#6A5ACD',
  DecisionDepositPlaced: '#FFA07A',
  Executed: '#00BFFF ',
  Rejected: '#FF5722',
  Submitted: '#6B9090',
  TimedOut: '#AD9C88',
  ToBeAwarded: '#FFA500'
};

export const TREASURY_TRACKS = ['treasurer', 'small_tipper', 'big_tipper', 'small_spender', 'medium_spender', 'big_spender'];
export const CONVICTIONS = [1, 2, 4, 8, 16, 32].map((lock, index): [value: number, duration: number, durationBn: BN] => [index + 1, lock, new BN(lock)]);
