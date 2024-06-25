// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/** 
 * @description
 * this hook returns a proxied proxies in non formatted style 
 * */

import { useCallback, useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountContext } from '../components';
import type { Proxy, ProxyTypes } from '../util/types';
import { getSubstrateAddress } from '../util/utils';

export default function useProxies(api: ApiPromise | undefined, proxiedAddress: string | AccountId | undefined | null, onlyAvailableWithTypes?: ProxyTypes[]): Proxy[] | undefined {
  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const [proxiesWithAvailability, setProxiesWithAvailability] = useState<Proxy[] | undefined>();
  const { accounts } = useContext(AccountContext);

  const getProxies = useCallback(() => {
    if (!proxies && api) {
      api.query.proxy?.proxies(proxiedAddress)
        .then((p) => {
          const fetchedProxies = JSON.parse(JSON.stringify(p[0])) as unknown as Proxy[];

          if (onlyAvailableWithTypes?.length && fetchedProxies) {
            return setProxies(fetchedProxies.filter((p) => onlyAvailableWithTypes.includes(p.proxyType)));
          }

          setProxies(fetchedProxies);
        }).catch(console.error);
    }
  }, [api, onlyAvailableWithTypes, proxiedAddress, proxies]);

  useEffect(() => {
    proxiedAddress && api && getProxies();
  }, [api, getProxies, proxiedAddress]);

  useEffect(() => {
    if (proxies && accounts && onlyAvailableWithTypes?.length) {
      const temp = proxies.filter((proxy) => accounts.find((acc) => acc.address === getSubstrateAddress(proxy.delegate)));

      setProxiesWithAvailability(temp);
    }
  }, [accounts, onlyAvailableWithTypes?.length, proxies]);

  if (onlyAvailableWithTypes?.length) {
    return proxiesWithAvailability;
  }

  return proxies;
}
