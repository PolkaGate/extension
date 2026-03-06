// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import { sanitizeChainName } from '../util';
import { getPeopleChainGenesisHash } from '../util/peopleChainUtils';
import useChainInfo from './useChainInfo';
import useMetadata from './useMetadata';

interface PeopleChainInfo {
  peopleChain: Chain | null | undefined;
  endpoint: string | undefined;
}

const allEndpoints = createWsEndpoints();

export default function usePeopleChain(genesisHash?: string): PeopleChainInfo {
  const { chainName } = useChainInfo(genesisHash, true);

  const peopleChainGenesisHash = getPeopleChainGenesisHash(chainName);

  const peopleChain = useMetadata(peopleChainGenesisHash, true);

  const maybeEndpoint = useMemo(() => {
    const peopleChainName = sanitizeChainName(peopleChain?.name);

    if (!peopleChainName) {
      return;
    }

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === peopleChainName?.toLowerCase() || String(e.info)?.toLowerCase() === peopleChainName?.toLowerCase());

    return endpoints?.length ? endpoints[0].value : undefined;
  }, [peopleChain]);

  return {
    endpoint: maybeEndpoint,
    peopleChain
  };
}
