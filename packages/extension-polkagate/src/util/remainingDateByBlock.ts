// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Utility to calculate the remaining date by block number.
 * Assumes an average block time of 6 seconds.
 *
 * @param nextBlock - The number of blocks remaining.
 * @returns A Date object representing the estimated time when the blocks will be mined.
 */

export default function RemainingDateByBlock (nextBlock: number): Date {
  const remainingInSeconds = nextBlock * 6;
  const nowInSeconds = Date.now() / 1000;
  const remainingTimestamp = (nowInSeconds + remainingInSeconds) * 1000;

  const remainingInDate = new Date(remainingTimestamp);

  return remainingInDate;
}
