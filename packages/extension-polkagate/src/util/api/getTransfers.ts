// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { TransferRequest } from '../types';

export function getTxTransfers (chainName: string, address: string, pageNum: number, pageSize: number): Promise<TransferRequest> {
  return postReq(`https://${chainName}.api.subscan.io/api/scan/transfers`, {
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
