// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterOptions, TransactionHistoryOutput } from './hookUtils/types';

import { useEffect, useRef, useState } from 'react';

import { mapRelayToSystemGenesisIfMigrated } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { useChainInfo } from '../../hooks';
import { keyMaker } from './hookUtils/utils';
import { useInfiniteScroll, useTransactionFetching, useTransactionGrouping, useTransactionProcessing, useTransactionState, useTransactionStorage } from './hooks';

/**
 * Main hook for managing transaction history
 * Orchestrates fetching, processing, storage, and display of transaction data
 */
export default function useTransactionHistory(address: string | undefined, _genesisHash: string | undefined, filterOptions?: FilterOptions): TransactionHistoryOutput {
  const genesisHash = mapRelayToSystemGenesisIfMigrated(_genesisHash);
  const { chain, decimal, token } = useChainInfo(genesisHash, true);

  // Create request identifier for validation
  const requested = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!address || !chain?.genesisHash) {
      return undefined;
    }

    requested.current = keyMaker(address, chain.genesisHash);
  }, [address, chain?.genesisHash]);

  const [isLoading, setIsLoading] = useState(false);

  // 1. Manage transaction state (received & extrinsics)
  const { allHistories,
    extrinsicsTx,
    isReadyToFetch,
    localHistories,
    receivedTx,
    resetAllState,
    setAllHistories,
    setExtrinsicsTx,
    setLocalHistories,
    setTransfersTx } = useTransactionState(address, chain);

  // 2. Handle fetching from API
  const { getExtrinsics, getTransfers } = useTransactionFetching({
    address,
    chain,
    requested,
    setExtrinsicsTx,
    setTransfersTx
  });

  // 3. Process raw transaction data
  const { processedExtrinsics, processedReceived } = useTransactionProcessing({
    chain,
    decimal,
    extrinsicsTx,
    onInitialLoadComplete: () => setIsLoading(false),
    receivedTx,
    token
  });

  // 4. Manage local storage
  useTransactionStorage({
    address,
    allHistories,
    chain,
    localHistories,
    processedExtrinsics,
    processedReceived,
    requested,
    setAllHistories,
    setLocalHistories
  });

  // 5. Group transactions by date with filtering
  const grouped = useTransactionGrouping({
    allHistories,
    extrinsicsTx,
    filterOptions,
    receivedTx
  });

  // 6. Setup infinite scroll
  useInfiniteScroll({
    extrinsicsTx,
    getExtrinsics,
    getTransfers,
    isReadyToFetch,
    receivedTx
  });

  // Reset state when address or chain changes
  useEffect(() => {
    if (isReadyToFetch) {
      setIsLoading(true);
      resetAllState();
    }
  }, [isReadyToFetch, resetAllState]);

  return {
    allHistories,
    count: allHistories?.length || 0,
    grouped,
    isLoading
  };
}
