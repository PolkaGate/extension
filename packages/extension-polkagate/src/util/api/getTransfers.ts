// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { keyMaker } from '@polkadot/extension-polkagate/src/popup/history/hookUtils/utils';

import { getSubscanChainName } from '../chain';
import getChainName from '../getChainName';
import { fetchFromSubscan } from '..';

function nullifier(requested: string) {
  return {
    code: 0,
    data: {
      count: 0,
      transfers: null
    },
    for: requested,
    generated_at: Date.now(),
    message: 'Success'
  } as unknown as TransferRequest;
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
  const network = getSubscanChainName(chainName) as unknown as string;

  if (network === 'pendulum') {
    return (await Promise.resolve(nullifier(requested)));
  }

  const transferRequest = await fetchFromSubscan<TransferRequest>(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
    address,
    direction: 'received',
    page: pageNum,
    row: pageSize
  });

  for (const item of transferRequest.data.transfers) {
    item.forAccount = address;
  }

  transferRequest.for = requested; // Checks with requested information in the useTransactionFetching hook

  return transferRequest;
}
