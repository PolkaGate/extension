// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';
import type { ApiResponse, PayoutsProp, PayoutSubscan, ReceivedFundInformation, ReferendaInformation, ReferendaProp, ReferendaStatus, ReferendaSubscan, StakingRewardInformation, TransfersProp, TransferSubscan } from './types';

import { getSubscanChainName, getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';
import { postData } from '@polkadot/extension-polkagate/src/util/api';
import { KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';
import getChainName from '@polkadot/extension-polkagate/src/util/getChainName';
import { isMigratedRelay, relayToSystemChains } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { BATCH_SIZE, MAX_RETRIES, RECEIVED_FUNDS_THRESHOLD, RECEIVED_REWARDS_THRESHOLD, REFERENDA_COUNT_TO_TRACK_DOT, REFERENDA_COUNT_TO_TRACK_KSM } from './constant';
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
      index: transfer.extrinsic_index,
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
      eventId: payout.event_index,
      index: payout.extrinsic_index,
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
      index: referenda.referendum_index,
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
 * @param chain - genesishash of the blockchain network
 * @returns Array of payouts information
 */
export const getReceivedFundsInformation = async (addresses: string[], chain: string): Promise<ReceivedFundInformation[]> => {
  const results: ReceivedFundInformation[] = [];

  // If the network is a migrated relay chain then there's no need to fetch received fund information on
  const isMigrateRelayChain = isMigratedRelay(chain);

  if (isMigrateRelayChain) {
    return results;
  }

  const chainName = getChainName(chain);
  const network = { text: getSubscanChainName(chainName), value: chain } as DropdownOption;

  // Helper function to process a single address
  const processAddress = async (address: string): Promise<ReceivedFundInformation | null> => {
    // let lastError: unknown = null;

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

        if (!receivedInfo.data.transfers || receivedInfo.data.transfers.length === 0) {
          // account doesn't have any history for this address on this network
          return null;
        }

        const transformed = transformTransfers(address, receivedInfo.data.transfers, network);

        return transformed as ReceivedFundInformation;
      } catch (_error) {
        // lastError = error;
        // console.warn(`Attempt ${attempt} failed for ${network.text} and address ${address} (RECEIVED). Retrying...`);

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    // if (lastError) {
    //   console.error(`(RECEIVED) Failed to fetch data for ${network.text} and address ${address} after ${MAX_RETRIES} attempts`, lastError);
    // }

    return null;
  };

  // Process addresses in batches
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);

    // console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} addresses`);

    // Process all addresses in the current batch concurrently
    const batchResults = await Promise.all(
      batch.map((address) => processAddress(address))
    );

    // Add non-null results to the results array
    batchResults.forEach((result) => {
      if (result) {
        results.push(result);
      }
    });

    // Optional: Add a small delay between batches to be extra safe with rate limits
    if (i + BATCH_SIZE < addresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay between batches
    }
  }

  return results;
};

/**
 * Fetches payouts information from subscan for the given addresses on the given chains
 * @param addresses - An array of addresses for which payout information fetch
 * @param chain - genesishash of the blockchain network
 * @returns Array of payouts information
 */
export const getPayoutsInformation = async (addresses: string[], chain: string): Promise<StakingRewardInformation[]> => {
  const results: StakingRewardInformation[] = [];

  // Handle migrated relay chains
  const isMigrated = isMigratedRelay(chain);
  const resolvedChain = isMigrated
    ? relayToSystemChains[chain].assetHub
    : chain;

  const chainName = getChainName(resolvedChain);
  const chainText = getSubscanChainName(chainName);

  const network = { text: chainText, value: resolvedChain } as DropdownOption;

  /**
   * Fetches and processes payout information for a single address
   */
  const processAddress = async (address: string): Promise<StakingRewardInformation | null> => {
    // let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Solo staking payouts
        const soloPayoutInfo = await postData(`https://${network.text}.api.subscan.io/api/v2/scan/account/reward_slash`, {
          address,
          category: 'Reward',
          row: RECEIVED_REWARDS_THRESHOLD
        }) as ApiResponse<{
          list: PayoutSubscan[]
        }>;

        // Nomination pool payouts
        const poolPayoutInfo = await postData(`https://${network.text}.api.subscan.io/api/scan/nomination_pool/rewards`, {
          address,
          category: 'Reward',
          row: RECEIVED_REWARDS_THRESHOLD
        }) as ApiResponse<{
          list: PayoutSubscan[]
        }>;

        // Ensure that at least ONE request succeeded
        if (poolPayoutInfo.code !== 0 && soloPayoutInfo.code !== 0) {
          throw new Error('Unexpected Subscan status code');
        }

        const payoutInfo = [
          ...(soloPayoutInfo?.data?.list ?? []),
          ...(poolPayoutInfo?.data?.list ?? [])];

        if (!payoutInfo || payoutInfo.length === 0) {
          return null; // account doesn't have any history
        }

        return transformPayouts(address, payoutInfo, network);
      } catch (_error) {
        // lastError = error;
        // console.warn(`Attempt ${attempt} failed for ${network.text} and address ${address} (PAYOUT). Retrying...`);

        // Retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    // if (lastError) {
    //   console.error(`(PAYOUT) Failed to fetch data for ${network.text} and address ${address} after ${MAX_RETRIES} attempts`, lastError);
    // }

    return null;
  };

  // Process addresses in batches
  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batch = addresses.slice(i, i + BATCH_SIZE);

    // console.log(`Processing payout batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} addresses`);

    // Process all addresses in the current batch concurrently
    const batchResults = await Promise.all(
      batch.map((address) => processAddress(address))
    );

    // Add non-null results to the results array
    batchResults.forEach((result) => {
      if (result) {
        results.push(result);
      }
    });

    // Safe spacing between batches to avoid rate limits
    if (i + BATCH_SIZE < addresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay between batches
    }
  }

  return results;
};

/**
 * Fetches referendas information from subscan for the given chains
 * @param chain - genesishash of the blockchain network
 * @returns Array of referendas information
 */
export const getReferendasInformation = async (chain: string): Promise<ReferendaInformation[]> => {
  const results: ReferendaInformation[] = [];

  // Handle migrated relay chains
  const isMigrated = isMigratedRelay(chain);
  const resolvedChain = isMigrated
    ? relayToSystemChains[chain].assetHub
    : chain;

  const chainName = getChainName(resolvedChain);
  const network = { text: getSubscanChainName(chainName), value: resolvedChain } as DropdownOption;

  // Decide how many referenda to fetch
  const REFERENDA_COUNT_TO_TRACK =
    network.value === POLKADOT_GENESIS_HASH
      ? REFERENDA_COUNT_TO_TRACK_DOT
      : network.value === KUSAMA_GENESIS_HASH
        ? REFERENDA_COUNT_TO_TRACK_KSM
        : 10; // fallback for testnets

  // let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const referendaInfo = await postData(`https://${network.text}.api.subscan.io/api/scan/referenda/referendums`, {
        row: REFERENDA_COUNT_TO_TRACK
      }) as ApiResponse<{
        list: ReferendaSubscan[] | null
      }>;

      if (referendaInfo.code !== 0) {
        throw new Error('Unexpected status code from Subscan');
      }

      if (!referendaInfo.data.list) {
        break; // no referenda found → break retry loop
      }

      results.push(transformReferendas(referendaInfo.data.list, network));
      break; // success → break retry loop
    } catch (_error) {
      // lastError = error;
      // console.warn(`Attempt ${attempt} failed for ${network.text} (REFERENDA). Retrying...`);

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  // If all retries fail, log the final error
  // if (lastError) {
  //   console.error(`(REFERENDA) Failed to fetch data for ${network.text} after ${MAX_RETRIES} attempts`, lastError);
  // }

  return results;
};
