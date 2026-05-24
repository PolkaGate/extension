// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getLink } from '@polkadot/extension-polkagate/src/popup/history/explorer';
import { keyMaker } from '@polkadot/extension-polkagate/src/popup/history/hookUtils/utils';

import getChainName from '../getChainName';
import { fetchFromSubscan } from '..';

function nullifier(requested: string) {
  return {
    code: 0,
    data: {
      count: 0,
      list: 0,
      transfers: null
    },
    for: requested,
    generated_at: Date.now(),
    message: 'Success'
  };
}

/**
 * Fetches received transfer transactions for an account from Subscan.
 *
 * - Resolves the Subscan network using the chain genesis hash
 * - Fetches paginated "received" transfers
 * - Tags the response with a request key to avoid stale updates
 *
 * @param address - Account address to fetch transfers for
 * @param genesisHash - Chain genesis hash
 * @param pageNum - Page number (pagination)
 * @param pageSize - Number of items per page
 *
 * @returns TransferRequest object containing transfer data
 */
export async function getTxTransfers(address: string, genesisHash: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  const requested = keyMaker(address, genesisHash);

  const chainName = getChainName(genesisHash);
  const { link } = getLink(chainName, 'transfers');

  if (!link) {
    return nullifier(requested);
  }

  const transferRequest = await fetchFromSubscan<TransferRequest>(link ?? '', {
    address,
    direction: 'received',
    page: pageNum,
    row: pageSize
  });

  if (!transferRequest.data.transfers) {
    return nullifier(requested);
  }

  for (const item of transferRequest.data.transfers) {
    item.forAccount = address;
  }

  transferRequest.for = requested; // Checks with requested information in the useTransactionFetching hook

  return transferRequest;
}
