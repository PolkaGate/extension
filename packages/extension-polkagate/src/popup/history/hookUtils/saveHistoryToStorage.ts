// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { log } from './utils';

// Saves transaction history to Chrome's local storage for a specific address and chain
export async function saveHistoryToStorage (address: string, genesisHash: string, transactions: TransactionDetail[]): Promise<void> {
  if (!address || !genesisHash || !transactions?.length) {
    log('Missing required parameters for saving history');

    return Promise.resolve();
  }

  try {
    log(`Saving ${transactions.length} transactions for ${address} on chain ${genesisHash}`);

    const storageData = (await getStorage(STORAGE_KEY.HISTORY)) as
      | Record<string, Record<string, TransactionDetail[]>>
      | undefined;

    const allHistories: Record<string, Record<string, TransactionDetail[]>> = storageData ?? {};

    // Ensure address entry exists
    allHistories[address] ??= {};

    // Update the history for this specific address and chain
    allHistories[address][genesisHash] = transactions;

    // Save the updated history object back to storage
    const success = await setStorage(STORAGE_KEY.HISTORY, allHistories);

    if (success) {
      log('History saved successfully to chrome storage, items:');
    }
  } catch (error) {
    console.error('Error in saveHistoryToStorage:', error);
  }
}
