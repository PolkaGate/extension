// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { ProxiedAccounts, Proxy } from '@polkadot/extension-polkagate/src/util/types';
import type { StorageKey } from '@polkadot/types';
import type { AnyTuple, Codec } from '@polkadot/types-codec/types';
import type { HexString } from '@polkadot/util/types';

import { useEffect, useState } from 'react';

import { useChainInfo, useFormatted } from '@polkadot/extension-polkagate/src/hooks';
import { getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';

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

    const proxies = await api.query['proxy']['proxies'].entries();

    return proxies;
}

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

/**
 * Hook to retrieve all accounts that have delegated proxy rights to a specific address.
 *
 * This hook monitors the specified address and returns all accounts that have granted
 * proxy permissions to it. The result updates automatically when the address, genesis hash,
 * or API instance changes.
 *
 * @param address - The address to check for proxy delegations (the potential proxy/delegate)
 * @param genesisHash - The genesis hash of the chain to query
 * @returns ProxiedAccounts object containing the genesis hash, list of proxied accounts, and the proxy address
 *
 * @example
 * const proxiedAccounts = useProxiedAccounts(userAddress, chainGenesisHash);
 * // proxiedAccounts.proxied will contain addresses that delegated to userAddress
 */
export default function useProxiedAccounts(address: string | undefined, genesisHash: HexString | null | undefined) {
    const { api } = useChainInfo(genesisHash);
    const formatted = useFormatted(address, genesisHash);

    const [proxied, setProxied] = useState<ProxiedAccounts>();

    useEffect(() => {
        if (!formatted || !genesisHash || !api) {
            return;
        }

        // If the proxy pallet doesn't exist on this chain, return empty result
        if (!api.query['proxy']) {
            return setProxied({
                genesisHash: api.genesisHash.toHex(),
                proxied: [],
                proxy: formatted
            });
        }

        let cancelled = false;

        fetchAllProxies(api)
            .then((proxies) => {
                if (cancelled) { // To cancel setting if api, formatted, or genesisHash change while fetchAllProxies is in-flight
                    return;
                }

                const proxiedAccounts = filterProxiedAccountsForDelegate(proxies, formatted);

                setProxied({
                    genesisHash: api.genesisHash.toHex(),
                    proxied: proxiedAccounts,
                    proxy: formatted
                });
            })
            .catch(console.error);

            return () => {
                cancelled = true;
            };
    }, [api, formatted, genesisHash]);

    return proxied;
}
