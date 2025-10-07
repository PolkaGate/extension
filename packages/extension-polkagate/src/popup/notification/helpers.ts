// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';
import type { ApiResponse, Payout, PayoutsProp, ReceivedFundInformation, StakingRewardInformation, Transfer, TransfersProp } from './types';

import { getSubscanChainName, getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';
import { postData } from '@polkadot/extension-polkagate/src/util/api';
import getChainName from '@polkadot/extension-polkagate/src/util/getChainName';

import { BATCH_SIZE, MAX_RETRIES } from './constant';
import { timestampToDate } from './util';

const transformTransfers = (address: string, transfers: Transfer[], network: DropdownOption) => {
  // Initialize the accumulator for the reduce function
  const initialAccumulator = {
    address,
    data: [] as TransfersProp[],
    network
  };

  // Sanitize each transfer item and accumulate results
  const result = transfers.reduce((accumulator, transfer) => {
    if (getSubstrateAddress(transfer.to) !== address) {
      return accumulator;
    }

    const sanitizedTransfer = {
      amount: transfer.amount,
      assetSymbol: transfer.asset_symbol,
      currencyAmount: transfer.currency_amount,
      date: timestampToDate(transfer.block_timestamp),
      from: transfer.from,
      fromAccountDisplay: transfer.from_account_display,
      timestamp: transfer.block_timestamp,
      toAccountId: transfer.to_account_display
    };

    accumulator.data.push(sanitizedTransfer);

    return accumulator;
  }, initialAccumulator);

  return result;
};

const transformPayouts = (address: string, payouts: Payout[], network: DropdownOption) => {
  // Initialize the accumulator for the reduce function
  const initialAccumulator = {
    address,
    data: [] as PayoutsProp[],
    network
  };
  // const decimal = selectableNetworks.find(({ genesisHash }) => (genesisHash[0] as unknown as string) === network.value)?.decimals[0];

  // Sanitize each transfer item and accumulate results
  const result = payouts.reduce((accumulator, payout) => {
    const sanitizedTransfer = {
      amount: payout.amount,
      date: timestampToDate(payout.block_timestamp),
      // decimal,
      era: payout.era,
      timestamp: payout.block_timestamp
      // validatorStash: payout.validator_stash
    } as PayoutsProp;

    accumulator.data.push(sanitizedTransfer);

    return accumulator;
  }, initialAccumulator);

  return result;
};

/**
 * Fetches transfers information from subscan for the given addresses on the given chains
 * @param addresses - An array of addresses for which payout information fetch
 * @param chains - Name of the blockchain network
 * @returns Array of payouts information
 */
export const getReceivedFundsInformation = async (addresses: string[], chains: string[]): Promise<ReceivedFundInformation[]> => {
  const results: ReceivedFundInformation[] = [];
  const networks = chains.map((value) => {
    const chainName = getChainName(value);

    return ({ text: getSubscanChainName(chainName), value }) as DropdownOption;
  });

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
            const receivedInfo = await postData(`https://${network.text}.api.subscan.io/api/v2/scan/transfers`, {
              address,
              row: 10
            }) as ApiResponse<{
              transfers: Transfer[] | null
            }>;

            if (receivedInfo.code !== 0) {
              throw new Error('Not a expected status code');
            }

            if (!receivedInfo.data.transfers) {
              return null; // account doesn't have any history
            }

            return transformTransfers(address, receivedInfo.data.transfers, network);
          } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed for ${network.text} and address ${address} (RECEIVED). Retrying...`);

            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }

        // If all retries fail, log the final error
        console.error(`(RECEIVED) Failed to fetch data for ${network.text} and address ${address} after ${MAX_RETRIES} attempts`, lastError);

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

/**
 * Fetches payouts information from subscan for the given addresses on the given chains
 * @param addresses - An array of addresses for which payout information fetch
 * @param chainNames - Name of the blockchain network
 * @returns Array of payouts information
 */
export const getPayoutsInformation = async (addresses: string[], chains: string[]): Promise<StakingRewardInformation[]> => {
  const results: StakingRewardInformation[] = [];
  const networks = chains.map((value) => {
    const chainName = getChainName(value);

    return ({ text: getSubscanChainName(chainName), value }) as DropdownOption;
  });

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
            const soloPayoutInfo = await postData(`https://${network.text}.api.subscan.io/api/v2/scan/account/reward_slash`, {
              address,
              category: 'Reward',
              row: 10
            }) as ApiResponse<{
              list: Payout[]
            }>;

            const poolPayoutInfo = await postData(`https://${network.text}.api.subscan.io/api/scan/nomination_pool/rewards`, {
              address,
              category: 'Reward',
              row: 10
            }) as ApiResponse<{
              list: Payout[]
            }>;

            if (poolPayoutInfo.code !== 0 && soloPayoutInfo.code !== 0) {
              throw new Error('Not a expected status code');
            }

            const payoutInfo = [...(soloPayoutInfo?.data?.list ?? []), ...(poolPayoutInfo?.data?.list ?? [])];

            if (!payoutInfo) {
              return null; // account doesn't have any history
            }

            console.log('payoutInfo.data.list:', payoutInfo);

            return transformPayouts(address, payoutInfo, network);
          } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed for ${network.text} and address ${address} (PAYOUT). Retrying...`);

            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }

        // If all retries fail, log the final error
        console.error(`(PAYOUT) Failed to fetch data for ${network.text} and address ${address} after ${MAX_RETRIES} attempts`, lastError);

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
