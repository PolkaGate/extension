// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getSubscanChainName } from '../chain';
import { fetchFromSubscan } from '..';

export const nullObject = {
  code: 0,
  data: {
    count: 0,
    transfers: null
  },
  generated_at: Date.now(),
  message: 'Failed'
} as unknown as TransferRequest;

export async function getTxTransfers(chainName: string, address: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  if (!chainName) {
    return (await Promise.resolve(nullObject));
  }

  const network = getSubscanChainName(chainName) as unknown as string;

  if (network === 'pendulum') {
    return (await Promise.resolve(nullObject));
  }

  const transferRequest = await fetchFromSubscan<TransferRequest>(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
    address,
    direction: 'received',
    page: pageNum,
    row: pageSize
  });

  transferRequest.for = `${address} - ${chainName}`;

  return transferRequest;
}
