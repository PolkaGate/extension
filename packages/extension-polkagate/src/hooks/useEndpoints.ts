// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/**
 * @description
 * find endpoints based on chainName and also omit light client which my be add later
 */
import type { LinkOption } from '@polkagate/apps-config/endpoints/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useEffect, useMemo, useState } from 'react';

import type { DropdownOption } from '../util/types';
import { sanitizeChainName } from '../util/utils';
import { useGenesisHashOptions, useTranslation } from './';

const supportedLC = ['Polkadot', 'Kusama', 'Westend']; // chains with supported light client

export function useEndpoints(genesisHash: string | null | undefined): DropdownOption[] {
  const { t } = useTranslation();
  const genesisOptions = useGenesisHashOptions();
  const [allEndpoints, setAllEndpoints] = useState<LinkOption[] | undefined>();

  useEffect(() => {
    const wsEndpoints = t && createWsEndpoints(t);

    setAllEndpoints(wsEndpoints);
  }, [t]);

  const endpoints: DropdownOption[] | undefined = useMemo(() => {
    if (!genesisHash) {
      return [];
    }

    const option = genesisOptions?.find((o) => o.value === genesisHash);
    const chainName = sanitizeChainName(option?.text);

    if (!chainName) {
      return undefined;
    }

    const endpoints = allEndpoints?.filter((e) => e.value &&
      (String(e.info)?.toLowerCase() === chainName?.toLowerCase() ||
        String(e.text)?.toLowerCase()?.includes(chainName?.toLowerCase()))
    );

    if (!endpoints) {
      return undefined;
    }

    const hasLightClientSupport = supportedLC.includes(chainName);
    const endpointOptions = endpoints.map((endpoint) => ({ text: endpoint.textBy, value: endpoint.value }))

    return hasLightClientSupport
      ? endpointOptions
      : endpointOptions.filter((o) => String(o.value).startsWith('wss'))
  }, [allEndpoints, genesisHash, genesisOptions]);

  return endpoints ?? [];
}
