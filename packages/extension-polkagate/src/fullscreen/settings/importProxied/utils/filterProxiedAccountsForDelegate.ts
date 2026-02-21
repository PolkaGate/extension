// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy } from '@polkadot/extension-polkagate/src/util/types';
import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec } from '@polkadot/types-codec/types';

import { getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';

/**
 * Filters proxy entries to find accounts that have delegated proxy rights to a specific address.
 *
 * This function processes raw proxy data and returns only the accounts (proxied accounts)
 * that have granted proxy permissions to the specified delegate address.
 *
 * @param proxies - Array of raw proxy entries from the blockchain
 * @param delegateAddress - The address to search for as a delegate/proxy
 * @returns Array of addresses that have delegated to the specified address
 *
 * @example
 * const proxies = await fetchAllProxies(api);
 * const accountsProxiedByAlice = filterProxiedAccountsForDelegate(proxies, aliceAddress);
 */
export function filterProxiedAccountsForDelegate(
    proxies: [StorageKey<AnyTuple>, Codec][],
    delegateAddress: string,
    convertToSubstrate?: boolean
): string[] {
    // Early return if no proxies exist
    if (proxies.length === 0) {
        return [];
    }

    const proxiedAccounts: string[] = [];

    // Iterate through all proxy entries
    for (const proxy of proxies) {
        // Extract the proxy data structure: [Proxy[], reserved_balance]
        const fetchedProxy = (proxy[1].toPrimitive() as [Proxy[], number])[0];

        const foundProxies = fetchedProxy.find(({ delegate }) => {
            const delegateFormatted = convertToSubstrate ? getSubstrateAddress(delegate) : delegate;

            return delegateFormatted === delegateAddress;
        });

        if (foundProxies) {
            proxiedAccounts.push(...proxy[0].toHuman() as string);
        }
    }

    return proxiedAccounts;
}
