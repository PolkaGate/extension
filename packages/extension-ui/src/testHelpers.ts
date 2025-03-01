// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

function setImmediate(fn: () => void): void {
  setTimeout(fn, 0);
}

export function flushAllPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
