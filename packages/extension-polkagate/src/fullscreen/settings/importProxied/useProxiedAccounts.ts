// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxiedAccounts } from '@polkadot/extension-polkagate/src/util/types';
import type { HexString } from '@polkadot/util/types';

import { useEffect, useState } from 'react';

import { useChainInfo, useFormatted } from '@polkadot/extension-polkagate/src/hooks';

import { fetchAllProxies } from './utils/fetchAllProxies';
import { filterProxiedAccountsForDelegate } from './utils/filterProxiedAccountsForDelegate';

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

    const [proxiedAccounts, setProxied] = useState<ProxiedAccounts>();

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

                const proxied = filterProxiedAccountsForDelegate(proxies, formatted);

                setProxied({
                    genesisHash: api.genesisHash.toHex(),
                    proxied,
                    proxy: formatted
                });
            })
            .catch(console.error);

            return () => {
                cancelled = true;
            };
    }, [api, formatted, genesisHash]);

    return proxiedAccounts;
}
