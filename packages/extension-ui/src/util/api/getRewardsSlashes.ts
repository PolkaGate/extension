// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import request from 'umi-request';

import { TransferRequest } from '../types';

export default function getRewardsSlashes(chainName: string, pageNum: number, pageSize: number, address: string): Promise<TransferRequest> {
  console.log('getting RewardsSlashes from Subscan ...');

  return postReq(`https://${chainName}.api.subscan.io/api/v2/scan/account/reward_slash`, {
    address,
    page: pageNum,
    row: pageSize
  });
}

function postReq(api: string, data: Record<string, any> = {}, option?: Record<string, any>): Promise<TransferRequest> {
  return request.post(api, {
    data,
    ...option
  });
}
