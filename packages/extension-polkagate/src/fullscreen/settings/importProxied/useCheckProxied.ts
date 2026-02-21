// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { ProxiedAccounts } from '@polkadot/extension-polkagate/src/util/types';

import { useCallback, useEffect, useState } from 'react';

import { useChainInfo } from '@polkadot/extension-polkagate/src/hooks';
import { getAndWatchStorage } from '@polkadot/extension-polkagate/src/util';
import { STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { fetchAllProxies, filterProxiedAccountsForDelegate } from './useProxiedAccounts';

const PROXIED_CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Hook used only in "check" mode.
 * Scans all extension accounts on Polkadot & Kusama and returns any proxied
 * accounts that haven't been checked yet (or whose check interval has expired).
 */
export default function useCheckProxied(accounts: AccountJson[]) {
    const emptyArray = accounts.length === 0;

    const { api: polkadotAPI } = useChainInfo(emptyArray ? undefined : STATEMINT_GENESIS_HASH);
    const { api: kusamaAPI } = useChainInfo(emptyArray ? undefined : STATEMINE_GENESIS_HASH);

    const [accountsToCheck, setAccountsToCheck] = useState<string[] | undefined>(undefined);
    const [allFoundProxiedAccounts, setAllFoundProxiedAccounts] = useState<ProxiedAccounts[] | undefined>(undefined);

    useEffect(() => {
        if (emptyArray) {
            return;
        }

        const unsubscribe = getAndWatchStorage(STORAGE_KEY.CHECK_PROXIED, (load) => {
            const checkProxied = load as { checkedAddresses: string[]; timestamp: number } | undefined;
            const checkedAccounts = checkProxied?.checkedAddresses;
            const isTimeExpired = ((checkProxied?.timestamp ?? 0) + PROXIED_CHECK_INTERVAL) < Date.now();

            const toCheck = (!checkedAccounts || isTimeExpired)
                ? accounts.map(({ address }) => address)
                : accounts.filter(({ address }) => !checkedAccounts.includes(address)).map(({ address }) => address);

            setAccountsToCheck(toCheck);
        });

        return unsubscribe;
    }, [accounts, emptyArray]);

    const checkForProxied = useCallback(async(api: ApiPromise) => {
        if (!accountsToCheck) {
            return [];
        }

        const proxies = await fetchAllProxies(api);
        const foundProxiedAccounts: ProxiedAccounts[] = [];

        for (const proxy of accountsToCheck) {
            const proxied = filterProxiedAccountsForDelegate(proxies, proxy, true);

            if (proxied.length === 0) {
                continue;
            }

            foundProxiedAccounts.push({
                genesisHash: api.genesisHash.toHex(),
                proxied,
                proxy
            });
        }

        return foundProxiedAccounts;
    }, [accountsToCheck]);

    const appendResults = useCallback((response: ProxiedAccounts[]) => {
        setAllFoundProxiedAccounts((prev) => prev ? prev.concat(response) : response);
    }, []);

    useEffect(() => {
        if (!accountsToCheck || !polkadotAPI) {
            return;
        }

        if (accountsToCheck.length === 0) {
            return setAllFoundProxiedAccounts(undefined);
        }

        checkForProxied(polkadotAPI).then(appendResults).catch(console.error);
    }, [accountsToCheck, checkForProxied, polkadotAPI, appendResults]);

    useEffect(() => {
        if (!accountsToCheck || !kusamaAPI) {
            return;
        }

        if (accountsToCheck.length === 0) {
            return setAllFoundProxiedAccounts(undefined);
        }

        checkForProxied(kusamaAPI).then(appendResults).catch(console.error);
    }, [accountsToCheck, checkForProxied, kusamaAPI, appendResults]);

    return { accountsToCheck, allFoundProxiedAccounts };
}
