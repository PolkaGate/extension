// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useContext, useEffect, useMemo, useState } from 'react';

import { APIContext } from '../components';
import { fastestConnection, sanitizeChainName } from '../util/utils';

const allEndpoints = createWsEndpoints();

export default function useApiWithChain (chain: Chain | null | undefined, api?: ApiPromise): ApiPromise | undefined {
  const apisContext = useContext(APIContext);
  const [_api, setApi] = useState<ApiPromise | undefined>();

  const maybeEndpoints = useMemo(() => {
    const chainName = sanitizeChainName(chain?.name);
    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.length ? endpoints : undefined;
  }, [chain?.name]);

  useEffect(() => {
    if (api) {
      return setApi(api);
    }

    const _genesisHash = chain?.genesisHash;

    if (_genesisHash && apisContext?.apis[_genesisHash]) {
      const maybeApi = apisContext.apis[_genesisHash].find(({ api }) => api?.isConnected)?.api;

      if (maybeApi) {
        console.log(`♻ using the saved api for ${chain.name} in useApiWithChain`);

        return setApi(maybeApi);
      }
    }

    if (!maybeEndpoints) {
      return;
    }

    fastestConnection(maybeEndpoints.map(({ text, ...rest }) => ({ text: String(text), ...rest })))
      .then(({ api }) => setApi(api))
      .catch(console.error);
  }, [api, apisContext, chain, maybeEndpoints]);

  return _api;
}
