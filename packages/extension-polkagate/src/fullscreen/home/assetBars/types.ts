// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

export interface AssetsWithUiAndPrice {
  percent: number;
  price: number;
  totalBalance: number;
  ui: {
    color: string | undefined;
    logo: string | undefined;
  };
  assetId?: number | string,
  chainName: string,
  date?: number,
  decimal: number,
  genesisHash: string,
  priceId: string,
  token: string,
  availableBalance: BN,
  soloTotal?: BN,
  pooledBalance?: BN,
  lockedBalance?: BN,
  vestingLocked?: BN,
  vestedClaimable?: BN,
  vestingTotal?: BN,
  freeBalance?: BN,
  frozenFee?: BN,
  frozenMisc: BN,
  reservedBalance?: BN,
  votingBalance?: BN
}
