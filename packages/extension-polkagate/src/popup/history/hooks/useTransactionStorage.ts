// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { type Dispatch, type RefObject, type SetStateAction, useEffect, useState } from 'react';

import { MAX_LOCAL_HISTORY_ITEMS } from '../hookUtils/consts';
import { getHistoryFromStorage } from '../hookUtils/getHistoryFromStorage';
import { saveHistoryToStorage } from '../hookUtils/saveHistoryToStorage';
import { log } from '../hookUtils/utils';

interface UseTransactionStorageProps {
  address: string | undefined;
  genesisHash: string | undefined;
  processedReceived: TransactionDetail[] | undefined;
  processedExtrinsics: TransactionDetail[] | undefined;
  setAllHistories: Dispatch<SetStateAction<TransactionDetail[] | null | undefined>>;
  allHistories: TransactionDetail[] | null | undefined;
  requested: RefObject<string | undefined>;
}

interface UseTransactionStorageResult {
  localHistories: TransactionDetail[] | null | undefined;
}

/**
 * Manages loading from and saving to local storage
 * Combines local and fetched transactions, removing duplicates
 */
export function useTransactionStorage({ address, allHistories, genesisHash, processedExtrinsics, processedReceived, requested, setAllHistories }: UseTransactionStorageProps): UseTransactionStorageResult {
  const [localHistories, setLocalHistories] = useState<TransactionDetail[] | null | undefined>(undefined);

  // Load transactions from local storage
  useEffect(() => {
    if (!address || !genesisHash) {
      return;
    }

    log(`Loading history from storage for ${String(address)} on chain ${genesisHash}`);

    getHistoryFromStorage(String(address), String(genesisHash))
      .then((history) => {
        const gHash = history?.[0].chain?.genesisHash;

        if (!gHash) {
          setLocalHistories(null);

          return;
        }

        const loadedContent = `${address} - ${gHash}`;
        const isValid = requested.current === loadedContent;

        if (isValid) {
          log(`Loaded ${history?.length || 0} transactions from storage`);
          setLocalHistories(history || null);
        } else {
          setLocalHistories(null);

          log('Invalid data loaded from storage and skipped!');
        }
      })
      .catch((error) => {
        console.error('Error loading history from storage:', error);
      });
  }, [address, genesisHash, requested]);

  // Combine all transaction sources and deduplicate
  useEffect(() => {
    if (localHistories === undefined || processedReceived === undefined || processedExtrinsics === undefined) {
      return;
    }

    const nothingToShow = localHistories === null && processedReceived.length === 0 && processedExtrinsics.length === 0;

    if (nothingToShow) {
      setAllHistories(null);
    }

    if (!localHistories?.length && !processedReceived.length && !processedExtrinsics.length) {
      return;
    }

    log('Combining transaction histories', {
      extrinsicsCount: processedExtrinsics.length,
      localCount: localHistories?.length ?? 0,
      receivedCount: processedReceived.length
    });

    const combined = deduplicateTransactions([
      ...processedReceived,
      ...processedExtrinsics,
      ...(localHistories ?? [])
    ]);

    // Sort by date (newest first)
    const sorted = combined.sort((a, b) => b.date - a.date);

    log(`Final history count: ${sorted.length} after deduplication`);
    setAllHistories(sorted);
  }, [processedReceived, processedExtrinsics, localHistories, setAllHistories]);

  // Save latest transactions to local storage
  useEffect(() => {
    if (!address || !genesisHash || !allHistories?.length) {
      return;
    }

    const gHash = allHistories[0].chain?.genesisHash;

    if (!gHash) {
      return;
    }

    const requestedContentToSave = `${address} - ${gHash}`;
    const isValid = requested.current === requestedContentToSave;

    if (!isValid) {
      log('Invalid data to save in storage and skipped!');

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
  }, [address, genesisHash, allHistories, requested]);

  return { localHistories };
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
