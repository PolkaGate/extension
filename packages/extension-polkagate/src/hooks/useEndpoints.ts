// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '../util/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import { useUserAddedEndpoint } from '../fullscreen/addNewChain/utils';
import { sanitizeChainName } from '../util';
import chains from '../util/chains';
import { AUTO_MODE } from '../util/constants';

const supportedLC = ['polkadot', 'kusama', 'westend']; // chains with supported light client
const allEndpoints = createWsEndpoints();

/**
 * @description
 * find endpoints based on chainName and also omit light client which my be add later
 */
export function useEndpoints (genesisHash: string | null | undefined): DropdownOption[] {
  const userAddedEndpoint = useUserAddedEndpoint(genesisHash);

  const endpoints: DropdownOption[] | undefined = useMemo(() => {
    if (!genesisHash) {
      return [];
    }

    const chainName = chains?.find((o) => o.genesisHash === genesisHash)?.name;
    const lsChainName = sanitizeChainName(chainName)?.toLowerCase();

    if (!lsChainName) {
      return undefined;
    }

    let endpoints = allEndpoints?.filter(({ info, text, value }) => {
      // Check if value matches the pattern 'wss://<any_number>'
      // and ignore due to its rate limits
      if (!value || /^wss:\/\/\d+$/.test(value) || value.includes('onfinality')) {
        return false;
      }

      const matchesName =
        String(info)?.toLowerCase() === lsChainName ||
        String(text)?.toLowerCase()?.includes(lsChainName);

      return matchesName;
    }
    );

    if (!endpoints.length) {
      return userAddedEndpoint ?? [];
    }

    // check if all endpoints belong to same chain
    const { genesisHashRelay, paraId } = endpoints[0];

    const areAllSame = endpoints.every((e) => e.paraId === paraId && e.genesisHashRelay === genesisHashRelay);

    if (!areAllSame) {
      // Fallback: just filter the exact comparison
      endpoints = endpoints?.filter(({ info }) => String(info)?.toLowerCase() === lsChainName);
    }

    // map to DropdownOption
    let endpointOptions = endpoints.map((endpoint) => ({ text: endpoint.textBy, value: endpoint.value }));

    const hasLightClientSupport = supportedLC.includes(lsChainName);

    if (!hasLightClientSupport) {
      endpointOptions = endpointOptions.filter((o) => String(o.value).startsWith('wss'));
    }

    if (endpointOptions.length > 1) {
      endpointOptions?.unshift(AUTO_MODE);
    }

    return endpointOptions;
  }, [genesisHash]);

  return endpoints ?? userAddedEndpoint ?? [];
}
