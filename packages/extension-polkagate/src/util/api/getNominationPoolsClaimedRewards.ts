// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getLink } from '@polkadot/extension-polkagate/src/popup/history/explorer';

import { fetchFromSubscan } from '..';

export function getNominationPoolsClaimedRewards(chainName: string, address: string, pageSize: number): Promise<TransferRequest> {
  const { link } = getLink(chainName, 'pool_rewards');

  return fetchFromSubscan(link ?? '',
    {
      address,
      row: pageSize
    });
}
