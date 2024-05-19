// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { ProxiedAccounts, Proxy } from '../util/types';
import useInfo from './useInfo';

/**
 * @description
 * this hook returns proxied accounts of a proxy account
 * */

export default function useProxiedAccounts (address: string | undefined): ProxiedAccounts | undefined {
  const { api, formatted } = useInfo(address);

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
    if (!address || !api || !formatted || (proxied && proxied.proxy === formatted)) {
      return;
    }

    if (proxied && proxied.proxy !== formatted) {
      setProxied(undefined);
    }

    getProxiedAccounts();
  }, [address, api, formatted, getProxiedAccounts, proxied]);

  return proxied;
}
