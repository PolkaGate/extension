// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

export interface ExposureOverview {
  total: BN;
  own: BN
  nominatorCount: BN;
  pageCount: BN;
}
export interface Prefs {
  commission: number;
  blocked: boolean;
}
