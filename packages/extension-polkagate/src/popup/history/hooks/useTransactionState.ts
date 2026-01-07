// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { TransactionDetail } from '@polkadot/extension-polkagate/src/util/types';
import type { RecordTabStatus, RecordTabStatusGov } from '../hookUtils/types';

import { type Dispatch, type RefObject, type SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { INITIAL_STATE } from '../hookUtils/consts';
import { extrinsicsReducer, log, receivedReducer } from '../hookUtils/utils';

interface UseTransactionStateResult {
  receivedTx: RecordTabStatus;
  extrinsicsTx: RecordTabStatusGov;
  receivedStateRef: RefObject<RecordTabStatus>;
  extrinsicsStateRef: RefObject<RecordTabStatusGov>;
  setTransfersTx: (payload: Partial<RecordTabStatus>) => void;
  setExtrinsicsTx: (payload: Partial<RecordTabStatusGov>) => void;
  resetAllState: () => void;
  isReadyToFetch: boolean;
  setAllHistories: Dispatch<SetStateAction<TransactionDetail[] | null | undefined>>;
  allHistories: TransactionDetail[] | null | undefined;
}

/**
 * Manages the state for received transfers and extrinsics transactions
 * Provides refs for latest state access and convenient dispatch functions
 */
export function useTransactionState(address: string | undefined, chain: Chain | null | undefined, chainName: string | undefined, genesisHash: string | undefined): UseTransactionStateResult {
  const [receivedTx, dispatchReceived] = useReducer(receivedReducer, INITIAL_STATE as RecordTabStatus);
  const [extrinsicsTx, dispatchExtrinsics] = useReducer(extrinsicsReducer, INITIAL_STATE as RecordTabStatusGov);

  const [allHistories, setAllHistories] = useState<TransactionDetail[] | null | undefined>(undefined);

  // Refs for accessing latest state in callbacks
  const receivedStateRef = useRef<RecordTabStatus>(receivedTx);
  const extrinsicsStateRef = useRef<RecordTabStatusGov>(extrinsicsTx);

  // Track previous values to detect changes
  const prevAddressRef = useRef<string | undefined>(undefined);
  const prevGenesisHashRef = useRef<string | undefined>(undefined);

  // Check if we have all required data to start fetching
  const isReadyToFetch = Boolean(address && genesisHash && chainName && chain);

  // Update refs when state changes
  useEffect(() => {
    receivedStateRef.current = receivedTx;
    log('Transfers state updated', { ...receivedTx });
  }, [receivedTx]);

  useEffect(() => {
    extrinsicsStateRef.current = extrinsicsTx;
    log('Extrinsics state updated', { ...extrinsicsTx });
  }, [extrinsicsTx]);

  // Convenience dispatch functions
  const setTransfersTx = useCallback((payload: Partial<RecordTabStatus>) => {
    log('Updating received state with', payload);
    dispatchReceived({ payload, type: 'UPDATE' });
  }, []);

  const setExtrinsicsTx = useCallback((payload: Partial<RecordTabStatusGov>) => {
    log('Updating extrinsics state with', payload);
    dispatchExtrinsics({ payload, type: 'UPDATE' });
  }, []);

  const resetAllState = useCallback(() => {
    dispatchReceived({ type: 'RESET' });
    dispatchExtrinsics({ type: 'RESET' });
    setAllHistories(undefined);
    log('All transaction state reset');
  }, []);

  // Detect and log input changes
  useEffect(() => {
    const addressChanged = String(address) !== prevAddressRef.current;
    const genesisHashChanged = genesisHash !== prevGenesisHashRef.current;

    if (addressChanged || genesisHashChanged) {
      log(`Input changed: address: ${addressChanged}, genesisHash: ${genesisHashChanged}`);
      prevAddressRef.current = String(address);
      prevGenesisHashRef.current = genesisHash;

      // If we have all data and something changed, reset state
      if (isReadyToFetch) {
        log('Resetting state due to input change');
        resetAllState();
      }
    }
  }, [address, genesisHash, isReadyToFetch, resetAllState]);

  return {
    allHistories,
    extrinsicsStateRef,
    extrinsicsTx,
    isReadyToFetch,
    receivedStateRef,
    receivedTx,
    resetAllState,
    setAllHistories,
    setExtrinsicsTx,
    setTransfersTx
  };
}
