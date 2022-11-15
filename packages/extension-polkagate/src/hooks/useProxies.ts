// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a proxied proxies in non formatted style 
 * */

import React, { useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { AccountContext } from '../components';
import { Proxy, ProxyTypes } from '../util/types';
import { getSubstrateAddress } from '../util/utils';

export default function useProxies(api: ApiPromise | undefined, proxiedAddress: string | undefined | null, onlyAvailable = false, onlyAvailableWithTypes?: ProxyTypes[]): Proxy[] | undefined {
  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const [proxiesWithAvailability, setProxiesWithAvailability] = useState<Proxy[] | undefined>();
  const { accounts } = useContext(AccountContext);

  useEffect(() => {
    proxiedAddress && api && api.query.proxy?.proxies(proxiedAddress)
      .then((p) => {
        const proxies = JSON.parse(JSON.stringify(p[0])) as unknown as Proxy[];

        if (onlyAvailableWithTypes?.length && proxies) {
          return setProxies(proxies.filter((p) => onlyAvailableWithTypes.includes(p.proxyType)));
        }

        setProxies(proxies);
      });
  }, [api, onlyAvailableWithTypes, proxiedAddress]);

  useEffect(() => {
    if (proxies && accounts && (onlyAvailable || onlyAvailableWithTypes?.length)) {
      const temp = proxies.filter((proxy) => {
        const found = accounts.find((acc) => acc.address === getSubstrateAddress(proxy.delegate));

        return !!found;
      });

      setProxiesWithAvailability(temp);
    }
  }, [accounts, onlyAvailable, onlyAvailableWithTypes?.length, proxies]);

  if (onlyAvailable || onlyAvailableWithTypes?.length) {
    return proxiesWithAvailability;
  }

  return proxies;
}
