// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

export const getReleaseDate = (remainingEras: BN, eraLength: number, eraProgress: number, blockTime: number): number => {
  // Calculate release time in seconds, then convert to milliseconds for timestamp
  const secToBeReleased = (Number(remainingEras.subn(1)) * eraLength + (eraLength - eraProgress)) * blockTime;

  return Date.now() + (secToBeReleased * 1000);
};
