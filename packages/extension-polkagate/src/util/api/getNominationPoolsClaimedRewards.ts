// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import request from 'umi-request';

import { getSubscanChainName } from '../chain';

export function getNominationPoolsClaimedRewards (chainName: string, address: string, pageSize: number): Promise<TransferRequest> {
   const network = getSubscanChainName(chainName) as unknown as string;

   return postReq(`https://${network}.api.subscan.io/api/scan/nomination_pool/rewards`, {
    address,
    row: pageSize
  });
}

function postReq (api: string, data: Record<string, unknown> = {}, option?: Record<string, unknown>): Promise<TransferRequest> {
  return request.post(api, { data, ...option });
}
