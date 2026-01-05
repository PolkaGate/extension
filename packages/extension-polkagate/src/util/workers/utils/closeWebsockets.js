// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {Object} ConnectionInfo
 * @property {Promise<import('@polkadot/api-derive/types')>} connection - The connection promise
 * @property {string} connectionEndpoint - The endpoint URL
 * @property {import('@polkadot/api').WsProvider} wsProvider - The WebSocket provider
 */

/**
 * Closes the open connections
 * @param {ConnectionInfo[]} connections
 */
export function closeWebsockets (connections) {
  Promise.allSettled(
    connections.map(({ wsProvider }) => wsProvider.disconnect())
  ).catch(console.error);
}
