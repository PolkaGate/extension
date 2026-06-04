// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getLink } from '@polkadot/extension-polkagate/src/popup/history/explorer';

import { SUBSCAN_FREE_PAGE_SIZE } from '../subscanLimits';
import { fetchFromSubscan } from '..';

export function getNominationPoolsClaimedRewards(chainName: string, address: string, pageSize: number): Promise<TransferRequest> {
  const { link } = getLink(chainName, 'pool_rewards');

  if (!link) {
    return Promise.resolve({
      code: 0,
      data: {
        count: 0,
        list: null,
        transfers: null
      },
      for: ''
    });
  }

  return fetchFromSubscan(link,
    {
      address,
      row: Math.min(pageSize, SUBSCAN_FREE_PAGE_SIZE)
    });
}
