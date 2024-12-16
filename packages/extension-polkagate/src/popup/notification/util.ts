// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { postData } from '../../util/api';
import { BATCH_SIZE, MAX_RETRIES } from './constant';

interface ApiResponse<T> {
  code: number;
  message: string;
  generated_at: number;
  data: T;
}

interface Transfer {
  transfer_id: number;
  from: string;
  from_account_display: AccountDisplay;
  to: string;
  to_account_display: AccountDisplayWithMerkle;
  extrinsic_index: string;
  success: boolean;
  hash: string;
  block_num: number;
  block_timestamp: number;
  module: string;
  amount: string;
  amount_v2: string;
  current_currency_amount: string;
  currency_amount: string;
  fee: string;
  nonce: number;
  asset_symbol: string;
  asset_unique_id: string;
  asset_type: string;
  item_id: string | null;
  event_idx: number;
  is_lock: boolean;
}

interface AccountDisplay {
  address: string;
  people: Record<string, unknown>;
}

interface AccountDisplayWithMerkle extends AccountDisplay {
  merkle?: {
    address_type: string;
    tag_type: string;
    tag_subtype: string;
    tag_name: string;
  };
}

interface TransfersProp {
  extrinsicIndex: string;
  from: string,
  fromAccountDisplay: AccountDisplay,
  to: string,
  toAccountDisplay: AccountDisplay,
  success: boolean,
  blockTimestamp: number,
  module: string,
  amount: string,
  assetSymbol: string
}

interface PayoutsProp {
  era: number;
  stash: string;
  account: string;
  validator_stash: string;
  amount: string;
  block_timestamp: number;
  module_id: string;
  event_id: string;
}

/**
 * Reorders the specified suffixes in a chain name:
 * - Moves the specified suffixes (if present) to the beginning of the text, separated by a hyphen.
 * - Removes "relay chain" and "network" from the chain name, as these are considered invalid suffixes.
 *
 * @param {string} chainName - The original chain name to be modified.
 * @param {string[]} [suffixes=['assethub']] - An array of suffixes to move and reorder, defaulting to ['assethub'].
 * @returns {string} The modified chain name with the specified suffixes reordered.
 */
const formatChainName = (chainName: string | undefined, suffixes: string[] = ['asset hub']): string => {
  // Handle undefined input
  if (!chainName) {
    return '';
  }

  // Find and remove the invalid suffixes
  const sanitized = chainName.toLowerCase().replace(' relay chain', '').replace(' network', '');

  // Find the matching suffix
  const matchedSuffix = suffixes.find((suffix) => sanitized.endsWith(suffix));

  // Find and remove the suffix
  let baseName = sanitized;

  if (matchedSuffix) {
    baseName = sanitized.replace(matchedSuffix, ''); // remove from the end of the string
  }

  // Capitalize the first letter of each part
  const formattedParts = [
    baseName.replaceAll(' ', ''),
    matchedSuffix?.replaceAll(' ', '') ?? ''
  ].filter(Boolean);

  // Join the parts in reverse order
  return formattedParts.reverse().join('-');
};

const transformTransfers = (address: string, transfers: Transfer[], networkName: string) => {
  // Initialize the accumulator for the reduce function
  const initialAccumulator = {
    address,
    data: [] as TransfersProp[],
    network: networkName
  };

  // Sanitize each transfer item and accumulate results
  const result = transfers.reduce((accumulator, transfer) => {
    if (transfer.to !== address) {
      return accumulator;
    }

    const sanitizedTransfer = {
      amount: transfer.amount_v2,
      assetSymbol: transfer.asset_symbol,
      blockTimestamp: transfer.block_timestamp,
      extrinsicIndex: transfer.extrinsic_index,
      from: transfer.from,
      fromAccountDisplay: transfer.from_account_display,
      module: transfer.module,
      success: transfer.success,
      to: transfer.to,
      toAccountDisplay: transfer.to_account_display
    };

    accumulator.data.push(sanitizedTransfer);

    return accumulator;
  }, initialAccumulator);

  return result;
};

export const getReceivedFundsInformation = async (addresses: string[], chainNames: string[]) => {
  const results: { address: string, data: TransfersProp[]; network: string; }[] = [];
  const networks = chainNames.map((chainName) => formatChainName(chainName));

  // Process each address
  for (const address of addresses) {
    // Process network in batches of BATCH_SIZE
    for (let i = 0; i < networks.length; i += BATCH_SIZE) {
      // Take a batch of BATCH_SIZE networks (or remaining networks if less than BATCH_SIZE)
      const networkBatch = networks.slice(i, i + BATCH_SIZE);

      // Create promises for this batch of networks with retry mechanism
      const batchPromises = networkBatch.map(async (network) => {
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const receivedInfo = await postData(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
              address,
              row: 10
            }) as ApiResponse<{
              transfers: Transfer[]
            }>;

            if (receivedInfo.code !== 0) {
              throw new Error('Not a expected status code');
            }

            return transformTransfers(address, receivedInfo.data.transfers, network);
          } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed for ${network} and address ${address} (RECEIVED). Retrying...`);

            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }

        // If all retries fail, log the final error
        console.error(`(RECEIVED) Failed to fetch data for ${network} and address ${address} after ${MAX_RETRIES} attempts`, lastError);

        return null;
      });

      // Wait for all address requests in this batch
      const batchResults = await Promise.all(batchPromises);

      // Add non-null results to overall results
      results.push(...batchResults.filter((result) => result !== null));

      // console.log('results:', results);

      // If not the last batch, wait for 1 second
      if (i + BATCH_SIZE < addresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return results;
};

export const getPayoutsInformation = async (addresses: string[], chainNames: string[]) => {
  const results: { address: string, data: PayoutsProp[]; network: string; }[] = [];
  const networks = chainNames.map((chainName) => formatChainName(chainName));

  // Process each address
  for (const address of addresses) {
    // Process networks in batches of BATCH_SIZE
    for (let i = 0; i < networks.length; i += BATCH_SIZE) {
      // Take a batch of BATCH_SIZE networks (or remaining networks if less than BATCH_SIZE)
      const networkBatch = networks.slice(i, i + BATCH_SIZE);

      // Create promises for this batch of networks with retry mechanism
      const batchPromises = networkBatch.map(async (network) => {
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            const payoutInfo = await postData(`https://${network}.api.subscan.io/api/v2/scan/account/reward_slash`, {
              address,
              row: 10
            }) as ApiResponse<{
              list: PayoutsProp[]
            }>;

            if (payoutInfo.code !== 0) {
              throw new Error('Not a expected status code');
            }

            return {
              address,
              data: payoutInfo.data.list,
              network
            };
          } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed for ${network} and address ${address} (PAYOUT). Retrying...`);

            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }

        // If all retries fail, log the final error
        console.error(`(PAYOUT) Failed to fetch data for ${network} and address ${address} after ${MAX_RETRIES} attempts`, lastError);

        return null;
      });

      // Wait for all address requests in this batch
      const batchResults = await Promise.all(batchPromises);

      // Add non-null results to overall results
      results.push(...batchResults.filter((result) => result !== null));

      // console.log('results:', results);

      // If not the last batch, wait for 1 second
      if (i + BATCH_SIZE < addresses.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return results;
};
