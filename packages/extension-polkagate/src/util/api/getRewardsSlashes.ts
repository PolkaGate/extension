// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getLink } from '@polkadot/extension-polkagate/src/popup/history/explorer';

import { fetchFromSubscan } from '..';

export default function getRewardsSlashes(chainName: string, address: string, filter: 'unclaimed' | 'claimed'): Promise<TransferRequest> {
  const { link } = getLink(chainName, 'reward_slash');

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

  return fetchFromSubscan(link, {
    address,
    category: 'Reward',
    claimed_filter: filter,
    is_stash: true,
    row: 100
  });
}
