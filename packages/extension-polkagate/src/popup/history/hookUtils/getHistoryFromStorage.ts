// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { normalizeHistoryGenesis } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { log } from './utils';

function deduplicateTransactions(transactions: TransactionDetail[]): TransactionDetail[] {
  const seenTxHashes = new Set<string>();
  const unique: TransactionDetail[] = [];

  for (const tx of transactions) {
    if (tx.txHash) {
      if (seenTxHashes.has(tx.txHash)) {
        continue;
      }

      seenTxHashes.add(tx.txHash);
    }

    unique.push(tx);
  }

  return unique;
}

// Retrieves transaction history from Chrome's local storage for a specific address and chain
export async function getHistoryFromStorage(address: string, genesisHash: string): Promise<TransactionDetail[] | undefined> {
  if (!address || !genesisHash) {
    log('Missing required parameters for loading history');

    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY.HISTORY, (res: Record<string, unknown>) => {
      try {
        const allHistories: Record<string, Record<string, TransactionDetail[]>> = (res?.[STORAGE_KEY.HISTORY] as Record<string, Record<string, TransactionDetail[]>> ?? {});

        // Navigate the nested structure: address -> genesisHash -> transactions
        const addressHistories: Record<string, TransactionDetail[]> = allHistories[address] || {};
        const normalizedGenesisHash = normalizeHistoryGenesis(genesisHash);
        const matchingBuckets = Object.entries(addressHistories).filter(
          ([storedGenesisHash]) => normalizeHistoryGenesis(storedGenesisHash) === normalizedGenesisHash
        );
        const chainHistory = matchingBuckets.flatMap(([, transactions]) => transactions ?? []);
        const matchingChainHistory = chainHistory.filter(
          (tx) => normalizeHistoryGenesis(tx.chain?.genesisHash) === normalizedGenesisHash
        );
        const filteredHistory = deduplicateTransactions(matchingChainHistory);
        const mergedCount = matchingBuckets.length;
        const filteredOutCount = chainHistory.length - filteredHistory.length;

        log(
          `Retrieved ${filteredHistory.length} transactions for ${address} on chain ${genesisHash} after merging ${mergedCount} bucket(s) and filtering out ${filteredOutCount} transaction(s)`
        );
        resolve(filteredHistory);
      } catch (error) {
        console.error('Error retrieving history from storage:', error);
        resolve(undefined);
      }
    });
  });
}
