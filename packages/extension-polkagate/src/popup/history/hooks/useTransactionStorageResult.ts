// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { useEffect, useState } from 'react';

import { MAX_LOCAL_HISTORY_ITEMS } from '../hookUtils/consts';
import { getHistoryFromStorage } from '../hookUtils/getHistoryFromStorage';
import { saveHistoryToStorage } from '../hookUtils/saveHistoryToStorage';
import { log } from '../hookUtils/utils';

interface UseTransactionStorageProps {
  address: string | undefined;
  genesisHash: string | undefined;
  processedReceived: TransactionDetail[];
  processedExtrinsics: TransactionDetail[];
}

interface UseTransactionStorageResult {
  localHistories: TransactionDetail[];
  allHistories: TransactionDetail[];
}

/**
 * Manages loading from and saving to local storage
 * Combines local and fetched transactions, removing duplicates
 */
export function useTransactionStorage({ address, genesisHash, processedExtrinsics, processedReceived }: UseTransactionStorageProps): UseTransactionStorageResult {
  const [localHistories, setLocalHistories] = useState<TransactionDetail[]>([]);
  const [allHistories, setAllHistories] = useState<TransactionDetail[]>([]);

  // Load transactions from local storage
  useEffect(() => {
    if (!address || !genesisHash) {
      return;
    }

    log(`Loading history from storage for ${String(address)} on chain ${genesisHash}`);

    getHistoryFromStorage(String(address), String(genesisHash))
      .then((history) => {
        log(`Loaded ${history?.length || 0} transactions from storage`);
        setLocalHistories(history || []);
      })
      .catch((error) => {
        console.error('Error loading history from storage:', error);
      });
  }, [address, genesisHash]);

  // Combine all transaction sources and deduplicate
  useEffect(() => {
    if (!localHistories?.length &&
        !processedReceived.length &&
        !processedExtrinsics.length) {
      return;
    }

    log('Combining transaction histories', {
      extrinsicsCount: processedExtrinsics.length,
      localCount: localHistories.length,
      receivedCount: processedReceived.length
    });

    const combined = deduplicateTransactions([
      ...processedReceived,
      ...processedExtrinsics,
      ...localHistories
    ]);

    // Sort by date (newest first)
    const sorted = combined.sort((a, b) => b.date - a.date);

    log(`Final history count: ${sorted.length} after deduplication`);
    setAllHistories(sorted);
  }, [processedReceived, processedExtrinsics, localHistories]);

  // Save latest transactions to local storage
  useEffect(() => {
    if (!address || !genesisHash || !allHistories?.length) {
      return;
    }

    const itemsToSave = Math.min(MAX_LOCAL_HISTORY_ITEMS, allHistories.length);

    log(`Saving latest ${itemsToSave} transactions to local storage`);

    const latestTransactions = allHistories.slice(0, MAX_LOCAL_HISTORY_ITEMS);
    const historyGenesisToSave = latestTransactions[0].chain?.genesisHash;

    // Guard: only save if genesis hash matches
    if (!historyGenesisToSave) {
      return;
    }

    saveHistoryToStorage(String(address), historyGenesisToSave, latestTransactions)
      .then(() => {
        log('Successfully saved latest transactions to local storage');
      })
      .catch((error) => {
        console.error('Error saving history to storage:', error);
      });
  }, [address, genesisHash, allHistories]);

  return {
    allHistories,
    localHistories
  };
}

/**
 * Remove duplicate transactions based on txHash
 * Prioritizes transactions that appear first (fetched data over local)
 */
function deduplicateTransactions(transactions: TransactionDetail[]): TransactionDetail[] {
  const seenTxHashes = new Set<string>();
  const unique: TransactionDetail[] = [];

  for (const tx of transactions) {
    if (tx.txHash) {
      if (!seenTxHashes.has(tx.txHash)) {
        seenTxHashes.add(tx.txHash);
        unique.push(tx);
      }
    } else {
      // Include transactions without txHash (though this is unusual)
      unique.push(tx);
    }
  }

  return unique;
}
