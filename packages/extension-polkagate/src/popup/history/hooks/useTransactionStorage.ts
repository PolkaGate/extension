// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { TransactionDetail } from '../../../util/types';

import { type Dispatch, type RefObject, type SetStateAction, useEffect } from 'react';

import { MAX_LOCAL_HISTORY_ITEMS } from '../hookUtils/consts';
import { getHistoryFromStorage } from '../hookUtils/getHistoryFromStorage';
import { saveHistoryToStorage } from '../hookUtils/saveHistoryToStorage';
import { keyMaker, log } from '../hookUtils/utils';

interface UseTransactionStorageProps {
  address: string | undefined;
  chain: Chain | null | undefined;
  processedReceived: TransactionDetail[] | undefined;
  processedExtrinsics: TransactionDetail[] | undefined;
  setAllHistories: Dispatch<SetStateAction<TransactionDetail[] | null | undefined>>;
  setLocalHistories: Dispatch<SetStateAction<TransactionDetail[] | null | undefined>>;
  allHistories: TransactionDetail[] | null | undefined;
  localHistories: TransactionDetail[] | null | undefined;
  requested: RefObject<string | undefined>;
}

interface UseTransactionStorageResult {
  localHistories: TransactionDetail[] | null | undefined;
}

/**
 * Manages loading from and saving to local storage
 * Combines local and fetched transactions, removing duplicates
 */
export function useTransactionStorage({ address, allHistories, chain, localHistories, processedExtrinsics, processedReceived, requested, setAllHistories, setLocalHistories }: UseTransactionStorageProps): UseTransactionStorageResult {
  // Load transactions from local storage
  useEffect(() => {
    if (!address || !chain?.genesisHash) {
      return;
    }

    log(`Loading history from storage for ${String(address)} on chain ${chain.genesisHash}`);

    getHistoryFromStorage(String(address), String(chain.genesisHash))
      .then((history) => {
        const gHash = history?.[0].chain?.genesisHash;

        if (!gHash) {
          setLocalHistories(null);

          return;
        }

        const loadedContent = keyMaker(address, gHash);
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
  }, [address, chain?.genesisHash, requested, setLocalHistories]);

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
    if (!address || !chain?.genesisHash || !allHistories?.length) {
      return;
    }

    const itemsToSave = Math.min(MAX_LOCAL_HISTORY_ITEMS, allHistories.length);
    const latestTransactions = allHistories.slice(0, MAX_LOCAL_HISTORY_ITEMS);

    log(`Saving latest ${itemsToSave} transactions to local storage:`, { latestTransactions });

    const gHash = latestTransactions[0].chain?.genesisHash;
    const addr = latestTransactions[0].forAccount;

    if (!gHash || !addr) {
      return;
    }

    const requestedContentToSave = keyMaker(addr, gHash);
    const isValid = requested.current === requestedContentToSave;

    if (!isValid) {
      log('Invalid data to save in storage and skipped!');

      return;
    }

    saveHistoryToStorage(String(address), chain.genesisHash, latestTransactions)
      .then(() => {
        log('Successfully saved latest transactions to local storage');
      })
      .catch((error) => {
        console.error('Error saving history to storage:', error);
      });
  }, [address, allHistories, chain?.genesisHash, requested]);

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
