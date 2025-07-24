// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

export default function RemainingDateByBlock(nextBlock: number): Date {
  const remainingInSeconds = nextBlock * 6;
  const nowInSeconds = Date.now() / 1000;
  const remainingTimestamp = (nowInSeconds + remainingInSeconds) * 1000;

  const remainingInDate = new Date(remainingTimestamp);

  return remainingInDate;
}
