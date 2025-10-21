// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';
import type { ApiResponse, PayoutsProp, PayoutSubscan, ReceivedFundInformation, ReferendaInformation, ReferendaProp, ReferendaSubscan, StakingRewardInformation, TransfersProp, TransferSubscan } from './types';

import { getSubscanChainName, getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';
import { postData } from '@polkadot/extension-polkagate/src/util/api';
import { KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';
import getChainName from '@polkadot/extension-polkagate/src/util/getChainName';
import { isMigratedRelay } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { BATCH_SIZE, MAX_RETRIES, RECEIVED_FUNDS_THRESHOLD, RECEIVED_REWARDS_THRESHOLD, REFERENDA_COUNT_TO_TRACK_DOT, REFERENDA_COUNT_TO_TRACK_KSM, type ReferendaStatus } from './constant';
import { timestampToDate } from './util';

const transformTransfers = (address: string, transfers: TransferSubscan[], network: DropdownOption) => {
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

const transformPayouts = (address: string, payouts: PayoutSubscan[], network: DropdownOption) => {
  // Initialize the accumulator for the reduce function
  const initialAccumulator = {
    address,
    data: [] as PayoutsProp[],
    network
  };

  // Sanitize each transfer item and accumulate results
  const result = payouts.reduce((accumulator, payout) => {
    const sanitizedTransfer = {
      amount: payout.amount,
      date: timestampToDate(payout.block_timestamp),
      era: payout.era,
      timestamp: payout.block_timestamp
    } as PayoutsProp;

    accumulator.data.push(sanitizedTransfer);

    return accumulator;
  }, initialAccumulator);

  return result;
};

const transformReferendas = (referendas: ReferendaSubscan[], network: DropdownOption) => {
  // Initialize the accumulator for the reduce function
  const initialAccumulator = {
    data: [] as ReferendaProp[],
    network
  };

  const filtered = referendas.filter(({ status }) => status);

  // Sanitize each transfer item and accumulate results
  const result = filtered.reduce((accumulator, referenda) => {
    const sanitizedReferenda = {
      account: referenda.account,
      callModule: referenda.call_module,
      chainName: network.text,
      createdTimestamp: referenda.created_block_timestamp,
      latestTimestamp: referenda.latest_block_timestamp,
      origins: referenda.origins,
      originsId: referenda.origins_id,
      referendumIndex: referenda.referendum_index,
      status: referenda.status.toLowerCase() as ReferendaStatus,
      title: referenda.title
    };

    accumulator.data.push(sanitizedReferenda);

    return accumulator;
  }, initialAccumulator);

  return result;
};

/**
 * Fetches transfers information from subscan for the given addresses on the given chains
 * @param addresses - An array of addresses for which payout information fetch
 * @param chains - genesishash of the blockchain network
 * @returns Array of payouts information
 */
export const getReceivedFundsInformation = async (addresses: string[], chains: string[]): Promise<ReceivedFundInformation[]> => {
  const results: ReceivedFundInformation[] = [];
  const networks = chains.map((value) => {
    // If the network is a migrated relay chain then there's no need to fetch received fund information on
    const isMigrateRelayChain = isMigratedRelay(value);

    if (isMigrateRelayChain) {
      return undefined;
    }

    const chainName = getChainName(value);

    return ({ text: getSubscanChainName(chainName), value }) as DropdownOption;
  }).filter((item) => !!item);

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
              row: RECEIVED_FUNDS_THRESHOLD
            }) as ApiResponse<{
              transfers: TransferSubscan[] | null
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
 * @param chains - genesishash of the blockchain network
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
              row: RECEIVED_REWARDS_THRESHOLD
            }) as ApiResponse<{
              list: PayoutSubscan[]
            }>;

            const poolPayoutInfo = await postData(`https://${network.text}.api.subscan.io/api/scan/nomination_pool/rewards`, {
              address,
              category: 'Reward',
              row: RECEIVED_REWARDS_THRESHOLD
            }) as ApiResponse<{
              list: PayoutSubscan[]
            }>;

            if (poolPayoutInfo.code !== 0 && soloPayoutInfo.code !== 0) {
              throw new Error('Not a expected status code');
            }

            const payoutInfo = [...(soloPayoutInfo?.data?.list ?? []), ...(poolPayoutInfo?.data?.list ?? [])];

            if (!payoutInfo) {
              return null; // account doesn't have any history
            }

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

/**
 * Fetches referendas information from subscan for the given chains
 * @param chains - genesishash of the blockchain network
 * @returns Array of payouts information
 */
export const getReferendasInformation = async (chains: string[]): Promise<ReferendaInformation[]> => {
  const results: ReferendaInformation[] = [];
  const networks = chains.map((value) => {
    const chainName = getChainName(value);

    return ({ text: getSubscanChainName(chainName), value }) as DropdownOption;
  });

  for (const network of networks) {
    let REFERENDA_COUNT_TO_TRACK = 10; // default for testnets is 10

    if (network.value === POLKADOT_GENESIS_HASH) {
      REFERENDA_COUNT_TO_TRACK = REFERENDA_COUNT_TO_TRACK_DOT;
    } else if (network.value === KUSAMA_GENESIS_HASH) {
      REFERENDA_COUNT_TO_TRACK = REFERENDA_COUNT_TO_TRACK_KSM;
    }

    const promise = async () => {
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const referendaInfo = await postData(`https://${network.text}.api.subscan.io/api/scan/referenda/referendums`, {
            row: REFERENDA_COUNT_TO_TRACK
          }) as ApiResponse<{
            list: ReferendaSubscan[] | null
          }>;

          if (referendaInfo.code !== 0) {
            throw new Error('Not a expected status code');
          }

          if (!referendaInfo.data.list) {
            return null; // no referenda found
          }

          return transformReferendas(referendaInfo.data.list, network);
        } catch (error) {
          lastError = error;
          console.warn(`Attempt ${attempt} failed for ${network.text} (REFERENDA). Retrying...`);

          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }

      // If all retries fail, log the final error
      console.error(`(REFERENDA) Failed to fetch data for ${network.text} after ${MAX_RETRIES} attempts`, lastError);

      return null;
    };

    const result = await promise();

    if (result) {
      // Add non-null results to overall results
      results.push(result);
    }

    // console.log('results:', results);
  }

  return results;
};
