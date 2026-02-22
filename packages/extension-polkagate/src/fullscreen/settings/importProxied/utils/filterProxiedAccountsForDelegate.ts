// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { StorageKey } from '@polkadot/types';
import type { Balance } from '@polkadot/types/interfaces';
//@ts-ignore
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { Vec } from '@polkadot/types-codec';
import type { AnyTuple, Codec, ITuple } from '@polkadot/types-codec/types';

import { getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';

type ProxyValue = ITuple<[Vec<PalletProxyProxyDefinition>, Balance]>;

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
    if (proxies.length === 0) {
        return [];
    }

    const proxiedAccounts: string[] = [];

    for (const [storageKey, codec] of proxies) {
        const value = codec as ProxyValue;
        const proxyDefs = value[0];

        const hasMatch = proxyDefs.some(({ delegate }) =>
            (convertToSubstrate
                ? getSubstrateAddress(delegate.toString())
                : delegate.toString()
            ) === delegateAddress
        );

        if (hasMatch) {
            proxiedAccounts.push(storageKey.args[0].toString());
        }
    }

    return proxiedAccounts;
}
