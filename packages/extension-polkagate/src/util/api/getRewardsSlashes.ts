// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import request from 'umi-request';

export default function getRewardsSlashes (chainName: string, address: string, filter: 'unclaimed' | 'claimed'): Promise<TransferRequest> {
  console.log('getting RewardsSlashes from Subscan ...');

  return postReq(`https://${chainName}.api.subscan.io/api/v2/scan/account/reward_slash`, {
    address,
    category: 'Reward',
    claimed_filter: filter,
    is_stash: true,
    row: 100
  });
}

function postReq (api: string, data: Record<string, unknown> = {}, option?: Record<string, unknown>): Promise<TransferRequest> {
  return request.post(api, {
    data,
    ...option
  });
}
