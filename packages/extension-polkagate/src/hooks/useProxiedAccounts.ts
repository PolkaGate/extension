// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { ProxiedAccounts, Proxy } from '../util/types';
import { getFormattedAddress } from '../util/utils';
import useApiWithChain from './useApiWithChain';

/**
 * @description
 * this hook returns proxied accounts on a proxy account
 * */

export default function useProxiedAccounts (address: string | undefined, chain: Chain | null | undefined): ProxiedAccounts | undefined {
  const api = useApiWithChain(chain);
  const formatted = address && getFormattedAddress(address, chain, 42);

  const [proxied, setProxied] = useState<ProxiedAccounts>();

  const getProxiedAccounts = useCallback(() => {
    api && api.query.proxy?.proxies.entries().then((proxies) => {
      if (proxies.length === 0) {
        return;
      }

      const proxiedAccounts: string[] = [];

      for (let index = 0; index < proxies.length; index++) {
        const proxy = proxies[index];

        const fetchedProxy = JSON.parse(JSON.stringify(proxy[1][0])) as Proxy[];

        const found = fetchedProxy.find(({ delegate }) => delegate === formatted);

        found && proxiedAccounts.push(...proxy[0].toHuman() as string);
      }

      setProxied({
        proxied: proxiedAccounts,
        proxy: formatted
      });
    }).catch(console.error);
  }, [api, formatted]);

  useEffect(() => {
    if (!address || !chain || !api || !formatted || (proxied && proxied.proxy === formatted)) {
      return;
    }

    if (proxied && proxied.proxy !== formatted) {
      setProxied(undefined);
    }

    getProxiedAccounts();
  }, [address, api, chain, formatted, getProxiedAccounts, proxied]);

  return proxied;
}
