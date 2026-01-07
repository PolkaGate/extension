// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterOptions, TransactionHistoryOutput } from './hookUtils/types';

import { useEffect, useState } from 'react';

import { mapRelayToSystemGenesisIfMigrated } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { useChainInfo } from '../../hooks';
import { useInfiniteScroll, useTransactionFetching, useTransactionGrouping, useTransactionProcessing, useTransactionState, useTransactionStorage } from './hooks';

/**
 * Main hook for managing transaction history
 * Orchestrates fetching, processing, storage, and display of transaction data
 */
export default function useTransactionHistory(address: string | undefined, _genesisHash: string | undefined, filterOptions?: FilterOptions, withObserver = true): TransactionHistoryOutput {
  const genesisHash = mapRelayToSystemGenesisIfMigrated(_genesisHash);
  const { chain, chainName, decimal, token } = useChainInfo(genesisHash, true);

  const [isLoading, setIsLoading] = useState(false);

  // 1. Manage transaction state (received & extrinsics)
  const { extrinsicsTx,
    isReadyToFetch,
    receivedTx,
    resetAllState,
    setExtrinsicsTx,
    setTransfersTx } = useTransactionState(address, chain, chainName, genesisHash);

  // 2. Handle fetching from API
  const { getExtrinsics, getTransfers } = useTransactionFetching({
    address,
    chain,
    chainName,
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
  const { allHistories } = useTransactionStorage({
    address,
    genesisHash,
    processedExtrinsics,
    processedReceived
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
    address,
    chainName,
    extrinsicsTx,
    getExtrinsics,
    getTransfers,
    isReadyToFetch,
    receivedTx,
    withObserver
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
