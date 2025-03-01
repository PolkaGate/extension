// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import request from 'umi-request';

const nullObject = {
  code: 0,
  data: {
    count: 0,
    transfers: null
  },
  generated_at: Date.now(),
  message: 'Success'
} as unknown as TransferRequest;

export function getTxTransfers(chainName: string, address: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  if (!chainName) {
    return Promise.resolve(nullObject);
  }

  let network = chainName.toLowerCase();

  if (network === 'pendulum') {
    return Promise.resolve(nullObject);
  }

  if (network === 'westendassethub') {
    network = 'westmint';
  }

  if (network.includes('assethub')) {
    network = `assethub-${network.replace(/assethub/, '')}`;
  }

  return postReq(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
    address,
    // from_block: 8658091,
    // to_block: 8684569,
    page: pageNum,
    row: pageSize
  });
}

function postReq(api: string, data: Record<string, unknown> = {}, option?: Record<string, unknown>): Promise<TransferRequest> {
  return request.post(api, { data, ...option });
}
