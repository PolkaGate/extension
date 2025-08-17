// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { postReq } from './getTXsHistory';

const nullObject = {
  code: 0,
  data: {
    count: 0,
    transfers: null
  },
  generated_at: Date.now(),
  message: 'Success'
} as unknown as TransferRequest;

export async function getTxTransfers (chainName: string, address: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  if (!chainName) {
    return (await Promise.resolve(nullObject));
  }

  let network = chainName.toLowerCase();

  if (network === 'pendulum') {
    return (await Promise.resolve(nullObject));
  }

  if (network === 'westendassethub') {
    network = 'westmint';
  }

  if (network.includes('assethub')) {
    network = `assethub-${network.replace(/assethub/, '')}`;
  }

  const transferRequest = await postReq<TransferRequest>(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
    address,
    direction: 'received',
    page: pageNum,
    row: pageSize
  });

  transferRequest.for = `${address} - ${chainName}`;

  return transferRequest;
}
