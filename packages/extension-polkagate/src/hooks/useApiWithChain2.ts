// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import getChainGenesisHash from '../util/getChainGenesisHash';
import { sanitizeChainName } from '../util/utils';
import useApi from './useApi';

const allEndpoints = createWsEndpoints();

export default function useApiWithChain2(chain: Chain | null | undefined): ApiPromise | undefined {
  const genesisHash = useMemo(() => chain?.genesisHash || getChainGenesisHash(chain?.name), [chain]);

  const maybeEndpoint = useMemo(() => {
    const chainName = sanitizeChainName(chain?.name);

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase() || String(e.info)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.length ? endpoints[0].value : undefined;
  }, [chain?.name]);

  const _api = useApi(undefined, undefined, maybeEndpoint, genesisHash);

  return _api;
}
