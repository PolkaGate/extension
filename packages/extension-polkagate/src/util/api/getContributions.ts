// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { TransferRequest } from '../types';

export default function getContributions(chainName: string, address: string): Promise<TransferRequest> {
  return postReq(`https://${chainName}.api.subscan.io/api/scan/account/contributions`, {
    page: 0,
    row: 100,
    who: address
  });
}

function postReq(api: string, data: Record<string, any> = {}, option?: Record<string, any>): Promise<TransferRequest> {
  return request.post(api, {
    data,
    ...option
  });
}
