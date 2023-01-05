// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function RemainingDateByBlock(nextBlock: number): Date {
  const remainingInSeconds = nextBlock * 6;
  const nowInSeconds = Date.now() / 1000;
  const remainingTimestamp = (nowInSeconds + remainingInSeconds) * 1000;

  const remainingInDate = new Date(remainingTimestamp);

  return remainingInDate;
}
