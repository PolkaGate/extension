// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getSubscanChainName } from '../chain';
import { fetchFromSubscan } from '..';

export default function getRewardsSlashes(chainName: string, address: string, filter: 'unclaimed' | 'claimed'): Promise<TransferRequest> {
  const network = getSubscanChainName(chainName) as unknown as string;

  return fetchFromSubscan(`https://${network}.api.subscan.io/api/v2/scan/account/reward_slash`, {
    address,
    category: 'Reward',
    claimed_filter: filter,
    is_stash: true,
    row: 100
  });
}
