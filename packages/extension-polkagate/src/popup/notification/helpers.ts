// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';
import type { ApiResponse, PayoutsProp, PayoutSubscan, ReceivedFundInformation, ReferendaInformation, ReferendaProp, ReferendaSubscan, StakingRewardInformation, TransfersProp, TransferSubscan } from './types';

import { getSubscanChainName, getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';
import { postData } from '@polkadot/extension-polkagate/src/util/api';
import { KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH } from '@polkadot/extension-polkagate/src/util/constants';
import getChainName from '@polkadot/extension-polkagate/src/util/getChainName';
import { isMigratedRelay } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { MAX_RETRIES, RECEIVED_FUNDS_THRESHOLD, RECEIVED_REWARDS_THRESHOLD, REFERENDA_COUNT_TO_TRACK_DOT, REFERENDA_COUNT_TO_TRACK_KSM, type ReferendaStatus } from './constant';
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

  // Process each address
  for (const address of addresses) {
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

        if (!receivedInfo.data.transfers || receivedInfo.data.transfers.length === 0) {
          // account doesn't have any history for this address on this network
          break;
        }

        const transformed = transformTransfers(address, receivedInfo.data.transfers, network);

        results.push(transformed as ReceivedFundInformation);

        // success - stop retrying for this address
        break;
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed for ${network.text} and address ${address} (RECEIVED). Retrying...`);

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    if (lastError) {
      console.error(`(RECEIVED) Failed to fetch data for ${network.text} and address ${address} after ${MAX_RETRIES} attempts`, lastError);
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
  // If the network is a migrated relay chain then there's no need to fetch received fund information on
  const isMigrateRelayChain = isMigratedRelay(chain);

  if (isMigrateRelayChain) {
    return results;
  }

  const chainName = getChainName(chain);
  const network = { text: getSubscanChainName(chainName), value: chain } as DropdownOption;

  // Process each address
  for (const address of addresses) {
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
          break; // account doesn't have any history
        }

        results.push(transformPayouts(address, payoutInfo, network));
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed for ${network.text} and address ${address} (PAYOUT). Retrying...`);

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    if (lastError) {
      console.error(`(PAYOUT) Failed to fetch data for ${network.text} and address ${address} after ${MAX_RETRIES} attempts`, lastError);
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
  // If the network is a migrated relay chain then there's no need to fetch received fund information on
  const isMigrateRelayChain = isMigratedRelay(chain);

  if (isMigrateRelayChain) {
    return results;
  }

  const chainName = getChainName(chain);
  const network = { text: getSubscanChainName(chainName), value: chain } as DropdownOption;

  let REFERENDA_COUNT_TO_TRACK = 10; // default for testnets is 10

  if (network.value === POLKADOT_GENESIS_HASH) {
    REFERENDA_COUNT_TO_TRACK = REFERENDA_COUNT_TO_TRACK_DOT;
  } else if (network.value === KUSAMA_GENESIS_HASH) {
    REFERENDA_COUNT_TO_TRACK = REFERENDA_COUNT_TO_TRACK_KSM;
  }

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
        break; // no referenda found
      }

      results.push(transformReferendas(referendaInfo.data.list, network));
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed for ${network.text} (REFERENDA). Retrying...`);

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  // If all retries fail, log the final error
  if (lastError) {
    console.error(`(REFERENDA) Failed to fetch data for ${network.text} after ${MAX_RETRIES} attempts`, lastError);
  }

  return results;
};
