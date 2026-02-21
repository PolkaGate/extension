// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec } from '@polkadot/types-codec/types';

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
export async function fetchAllProxies(api: ApiPromise, pageSize = 1_000) {
    if (!api.query['proxy']) {
        return [];
    }

    const result: [StorageKey<AnyTuple>, Codec][] = [];
    let startKey: string | undefined;

    try {
        while (true) {
            const page = await api.query['proxy']['proxies'].entriesPaged({
                args: [],
                pageSize,
                startKey
            });

            if (!page.length) {
                break;
            }

            result.push(...page);

            // next page starts after last key
            startKey = page[page.length - 1][0].toHex();
        }

        return result;
    } catch (e) {
        console.error('Something went wrong while fetching proxids!', e);

        return result;
    }
}
