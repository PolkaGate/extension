// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { log } from './utils';

// Saves transaction history to Chrome's local storage for a specific address and chain
export async function saveHistoryToStorage (address: string, genesisHash: string, transactions: TransactionDetail[]): Promise<void> {
  if (!address || !genesisHash || !transactions?.length) {
    log('Missing required parameters for saving history');

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      log(`Saving ${transactions.length} transactions for ${address} on chain ${genesisHash}`);

      // First, get the current history object
      chrome.storage.local.get('history', (res: Record<string, unknown>) => {
        // Initialize with empty object if not exists
        const allHistories: Record<string, Record<string, TransactionDetail[]>> = (res?.['history'] as Record<string, Record<string, TransactionDetail[]>> ?? {});

        // Ensure the address entry exists
        if (!allHistories[address]) {
          allHistories[address] = {};
        }

        // Update the history for this specific address and chain
        allHistories[address][genesisHash] = transactions;

        // Save the updated history object back to storage
        chrome.storage.local.set({ history: allHistories }, () => {
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;

            console.error('Error saving history to chrome storage:', error);
            reject(error);
          } else {
            log('History saved successfully to chrome storage, items:');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error in saveHistoryToStorage:', error);
      reject(error);
    }
  });
}
