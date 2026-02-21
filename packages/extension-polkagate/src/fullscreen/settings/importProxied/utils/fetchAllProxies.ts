// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

/**
 * Fetches all proxy entries from the blockchain.
 *
 * This function retrieves all proxy relationships stored on-chain without any filtering.
 * It can be reused in any context where raw proxy data is needed.
 *
 * @param api - The Polkadot API instance
 * @returns Promise resolving to an array of proxy entries, or empty array if proxy pallet is not available
 *
 * @example
 * const allProxies = await fetchAllProxies(api);
 */
export async function fetchAllProxies(api: ApiPromise) {
    // Check if the proxy pallet exists on this chain
    if (!api.query['proxy']) {
        return [];
    }

    return await api.query['proxy']['proxies'].entries();
}
