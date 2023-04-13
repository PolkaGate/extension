// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * find endpoints based on chainName and also omit light client which my be add later
 */
import { useEffect, useMemo, useState } from 'react';

import { createWsEndpoints } from '@polkadot/apps-config';
import { LinkOption } from '@polkadot/apps-config/settings/types';

import { useGenesisHashOptions, useTranslation } from './';
import { sanitizeChainName } from '../util/utils';

interface Option {
  text: string;
  value: string;
}

export function useEndpoints(genesisHash: string | null | undefined): Option[] {
  const { t } = useTranslation();
  const genesisOptions = useGenesisHashOptions();

  const [allEndpoints, setAllEndpoints] = useState<LinkOption[] | undefined>();

  useEffect(() => {
    const wsEndpoints = t && createWsEndpoints(t);

    setAllEndpoints(wsEndpoints);
  }, [t]);

  const endpoints: Option[] | undefined = useMemo(() => {
    if (!genesisHash) {
      return [];
    };
    const option = genesisOptions?.find((o) => o.value === genesisHash);
    const chainName = sanitizeChainName(option?.text);

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === chainName?.toLowerCase());

    return endpoints?.filter((e) => String(e.value).startsWith('wss')).map((e) => ({ text: e.textBy, value: e.value }));
  }, [allEndpoints, genesisHash, genesisOptions]);

  return endpoints ?? [];
}
