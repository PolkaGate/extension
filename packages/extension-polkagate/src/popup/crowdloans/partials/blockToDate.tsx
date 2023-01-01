// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function blockToDate(blockNumber?: number, currentBlock?: number) {
  if (!blockNumber || !currentBlock) {
    return 'N/A';
  }

  if (blockNumber >= currentBlock) {
    const time = (blockNumber - currentBlock) * 6000;
    const now = Date.now();

    return new Date(now + time).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const diff = (currentBlock - blockNumber) * 6000;
  const now = Date.now();

  return new Date(now - diff).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
