// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { normalizeHistoryGenesis } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { log } from './utils';

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
        const chainHistory: TransactionDetail[] = addressHistories[genesisHash];
        const normalizedGenesisHash = normalizeHistoryGenesis(genesisHash);
        const filteredHistory = chainHistory?.filter((tx) => normalizeHistoryGenesis(tx.chain?.genesisHash) === normalizedGenesisHash);

        if (chainHistory?.length !== filteredHistory?.length) {
          log(`Filtered out ${(chainHistory?.length || 0) - (filteredHistory?.length || 0)} wrong-chain transactions for ${address} on chain ${genesisHash}`);
        }

        log(`Retrieved ${filteredHistory?.length || 0} transactions for ${address} on chain ${genesisHash}`);
        resolve(filteredHistory);
      } catch (error) {
        console.error('Error retrieving history from storage:', error);
        resolve(undefined);
      }
    });
  });
}
