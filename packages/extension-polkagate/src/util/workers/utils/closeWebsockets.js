// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

export function closeWebsockets (connections) {
  connections.forEach((con) => con.wsProvider.disconnect().catch(handleError));
}

export function handleError (error) {
  console.error('Error:', error);
}
