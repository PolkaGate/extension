// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { ProxiedAccounts, Proxy } from '../util/types';
import useInfo from './useInfo';

/**
 * @description
 * this hook returns proxied accounts of a proxy account
 * */

export default function useProxiedAccounts (address: string | undefined): ProxiedAccounts | undefined {
  const { api, formatted, genesisHash } = useInfo(address);

  const [proxied, setProxied] = useState<ProxiedAccounts>();

  const getProxiedAccounts = useCallback((api: ApiPromise, formatted: string) => {
    api.query.proxy?.proxies.entries().then((proxies) => {
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
        genesisHash: api.genesisHash.toHex(),
        proxied: proxiedAccounts,
        proxy: formatted
      });
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setProxied(undefined);
  }, [formatted, genesisHash]);

  return useMemo(() => {
    if (!api || !formatted || !genesisHash || (api && api.genesisHash.toHex() !== genesisHash)) {
      return undefined;
    }

    if (proxied && (proxied.genesisHash !== genesisHash || proxied.proxy !== formatted)) {
      return undefined;
    }

    if (proxied && proxied.proxy === formatted) {
      return proxied;
    }

    !proxied && getProxiedAccounts(api, formatted);

    return undefined; // to suppress the problem of useMemo should have a return
  }, [api, formatted, genesisHash, proxied, getProxiedAccounts]);
}
