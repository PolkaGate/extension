// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LinkOption } from '@polkagate/apps-config/endpoints/types';
import type { DropdownOption } from '../util/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useEffect, useMemo, useState } from 'react';

import { sanitizeChainName } from '../util/utils';
import { useGenesisHashOptions, useTranslation } from './';
import { AUTO_MODE } from '../util/constants';

const supportedLC = ['Polkadot', 'Kusama', 'Westend']; // chains with supported light client

/**
 * @description
 * find endpoints based on chainName and also omit light client which my be add later
 */
export function useEndpoints (genesisHash: string | null | undefined): DropdownOption[] {
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

    const endpoints = allEndpoints?.filter((e) => e.value &&
      (String(e.info)?.toLowerCase() === chainName?.toLowerCase() ||
        String(e.text)?.toLowerCase()?.includes(chainName?.toLowerCase() ?? ''))
    );

    const endpointOptions = chainName
      ? supportedLC.includes(chainName)
        ? endpoints?.map((endpoint) => ({ text: endpoint.textBy, value: endpoint.value }))
        : endpoints?.filter((e) => String(e.value).startsWith('wss')).map((e) => ({ text: e.textBy, value: e.value }))
      : undefined;

    endpointOptions && endpointOptions?.length > 1 &&
      endpointOptions?.unshift(AUTO_MODE);

    return endpointOptions;
    // return endpoints?.filter((e) => String(e.value).startsWith('wss')).map((e) => ({ text: e.textBy, value: e.value }));
  }, [allEndpoints, genesisHash, genesisOptions]);

  return endpoints ?? [];
}
