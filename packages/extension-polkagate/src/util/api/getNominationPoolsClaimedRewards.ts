// Copyright 2019-2026@polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferRequest } from '../types';

import { getSubscanChainName } from '../chain';
import { fetchFromSubscan } from '..';

export function getNominationPoolsClaimedRewards(chainName: string, address: string, pageSize: number): Promise<TransferRequest> {
  const network = getSubscanChainName(chainName) as unknown as string;

  return fetchFromSubscan(`https://${network}.api.subscan.io/api/scan/nomination_pool/rewards`,
    {
      address,
      row: pageSize
    });
}
