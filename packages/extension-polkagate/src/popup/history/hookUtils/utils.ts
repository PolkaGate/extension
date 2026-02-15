// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicsAction, ReceivedAction, RecordTabStatus, RecordTabStatusGov } from './types';

import { DEBUG, INITIAL_STATE } from './consts';

// Helper for consistent logging format
export const log = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[TxHistory] ${message}`, data !== undefined ? data : '');
  }
};

export const formatString = (input: string) => input.replaceAll('_', ' ');

// Reducers with reset capability
export const receivedReducer = (state: RecordTabStatus, action: ReceivedAction): RecordTabStatus => {
  switch (action.type) {
    case 'RESET':
      log('Resetting transfers state');

      return INITIAL_STATE as RecordTabStatus;
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const extrinsicsReducer = (state: RecordTabStatusGov, action: ExtrinsicsAction): RecordTabStatusGov => {
  switch (action.type) {
    case 'RESET':
      log('Resetting extrinsics state');

      return INITIAL_STATE as RecordTabStatusGov;
    case 'UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const keyMaker = (address: string, genesisHash: string) => {
  return `${address}-${genesisHash}`;
};
