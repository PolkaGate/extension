// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { TransferRequest } from '../types';

const nullObject = {
  code: 0,
  message: 'Success',
  generated_at: Date.now(),
  data: {
    count: 0,
    transfers: null
  }
};

export function getTxTransfers (chainName: string, address: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  if (!chainName) {
    return nullObject;
  }

  let network = chainName;

  if (chainName.toLowerCase() === 'pendulum') {
    return nullObject;
  }

  if (chainName === 'WestendAssetHub') {
    network = 'westmint';
  }

  if (chainName.toLowerCase().includes('assethub')) {
    network = `assethub-${chainName.toLowerCase().replace(/assethub/, '')}`;
  }

  return postReq(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
    address,
    // from_block: 8658091,
    // to_block: 8684569,
    page: pageNum,
    row: pageSize
  });
}

function postReq (api: string, data: Record<string, any> = {}, option?: Record<string, any>): Promise<TransferRequest> {
  return request.post(api, { data, ...option });
}
