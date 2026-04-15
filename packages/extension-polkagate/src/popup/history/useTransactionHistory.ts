// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterOptions, TransactionHistoryOutput } from './hookUtils/types';

import { useEffect, useRef } from 'react';

import { mapRelayToSystemGenesisIfMigrated, normalizeHistoryGenesis } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

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

  // 1. Manage transaction state (received & extrinsics)
  const { allHistories,
    extrinsicsTx,
    isLoading,
    isReadyToFetch,
    localHistories,
    receivedTx,
    setAllHistories,
    setExtrinsicsTx,
    setIsLoading,
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
    address,
    chain,
    decimal,
    extrinsicsTx,
    receivedTx,
    setIsLoading,
    token
  });

  // 4. Manage local storage
  useTransactionStorage({
    address,
    allHistories,
    genesisHash,
    localHistories,
    processedExtrinsics,
    processedReceived,
    requested,
    setAllHistories,
    setLocalHistories
  });

  // Prefer the freshly combined in-memory history once it exists.
  // The storage cache only contains the latest subset and should be a fallback,
  // not the primary source after fetch/merge completes.
  const _all = allHistories ?? localHistories;
  const normalizedGenesisHash = normalizeHistoryGenesis(genesisHash);
  const chainScopedHistories = _all?.filter((item) => {
    const itemGenesisHash = item.chain?.genesisHash;

    if (!itemGenesisHash || !genesisHash) {
      return false;
    }

    return normalizeHistoryGenesis(itemGenesisHash) === normalizedGenesisHash;
  });
  // 5. Group transactions by date with filtering
  const grouped = useTransactionGrouping({
    allHistories: _all === null ? null : chainScopedHistories,
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

  const hasVisibleHistory = _all !== undefined;
  const isFetchingMore = hasVisibleHistory && Boolean(receivedTx.isFetching || extrinsicsTx.isFetching);

  return {
    allHistories: _all === null ? null : chainScopedHistories,
    count: chainScopedHistories?.length || 0,
    grouped,
    isFetchingMore,
    isLoading
  };
}
