// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

const AYE_BITS = 0b10000000;

export const isAye = (voteHex: string): boolean =>
  (parseInt(voteHex, 16) & AYE_BITS) === AYE_BITS;

export const formatAmount = (raw: number, decimal: number): number =>
  Number((raw / 10 ** decimal).toFixed(6));
