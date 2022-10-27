// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a proxied proxies in non formatted style 
 * */

import React, { useContext, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { AccountContext } from '../components';
import { Proxy } from '../util/types';
import { getSubstrateAddress } from '../util/utils';

export default function useProxies(api: ApiPromise | undefined, proxiedAddress: string | undefined | null, onlyAvailable = false): Proxy[] | undefined {
  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const [proxiesWithAvailability, setProxiesWithAvailability] = useState<Proxy[] | undefined>();
  const { accounts } = useContext(AccountContext);

  useEffect(() => {
    proxiedAddress && api && api.query.proxy?.proxies(proxiedAddress)
      .then((p) => setProxies(JSON.parse(JSON.stringify(p[0]))) as unknown as Proxy[]);
  }, [api, proxiedAddress]);

  useEffect(() => {
    if (proxies && accounts && onlyAvailable) {
      const temp = proxies.filter((proxy) => {
        const found = accounts.find((acc) => acc.address === getSubstrateAddress(proxy.delegate));

        return !!found;
      });

      setProxiesWithAvailability(temp);
    }
  }, [accounts, onlyAvailable, proxies]);

  if (!onlyAvailable) {
    return proxies;
  } else {
    return proxiesWithAvailability;
  }
}
