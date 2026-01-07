// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getSubscanChainName } from '../chain';
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
    message: 'Failed'
  } as unknown as TransferRequest;
}

export async function getTxTransfers(chainName: string, address: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  const requested = `${address} - ${chainName}`;
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

  transferRequest.for = requested; // Checks with requested information in the useTransactionFetching hook

  return transferRequest;
}
