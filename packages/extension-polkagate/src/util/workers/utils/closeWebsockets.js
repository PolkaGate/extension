// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

export function closeWebsockets(connections) {
  connections.forEach(
    ({ wsProvider }) =>
      wsProvider
        .disconnect()
        .catch(console.error));
}
