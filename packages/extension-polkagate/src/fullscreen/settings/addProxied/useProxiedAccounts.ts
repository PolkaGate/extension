// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxiedAccounts, Proxy } from '@polkadot/extension-polkagate/src/util/types';
import type { HexString } from '@polkadot/util/types';

import { useEffect, useState } from 'react';

import { useChainInfo, useFormatted } from '@polkadot/extension-polkagate/src/hooks';

export default function useProxiedAccounts(address: string | undefined, genesisHash: HexString | null | undefined) {
    const { api } = useChainInfo(genesisHash);
    const formatted = useFormatted(address, genesisHash);

    const [proxied, setProxied] = useState<ProxiedAccounts>();

    useEffect(() => {
        if (!formatted || !genesisHash || !api) {
            return;
        }

        if (!api.query['proxy']) {
            return setProxied({
                genesisHash: api.genesisHash.toHex(),
                proxied: [],
                proxy: formatted
            });
        }

        api.query['proxy']['proxies'].entries().then((proxies) => {
            if (proxies.length === 0) {
                return setProxied({
                    genesisHash: api.genesisHash.toHex(),
                    proxied: [],
                    proxy: formatted
                });
            }

            const proxiedAccounts: string[] = [];

            for (const proxy of proxies) {
                const fetchedProxy = (proxy[1].toPrimitive() as [Proxy[], number])[0];
                const foundProxies = fetchedProxy.find(({ delegate }) => delegate === formatted);

                if (foundProxies) {
                    proxiedAccounts.push(...proxy[0].toHuman() as string);
                }
            }

            setProxied({
                genesisHash: api.genesisHash.toHex(),
                proxied: proxiedAccounts,
                proxy: formatted
            });
        })
            .catch(console.error);
    }, [api, formatted, genesisHash]);

    return proxied;
}
