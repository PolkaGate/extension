// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { PEOPLE_CHAINS } from '../util/constants';
import getChain from '../util/getChain';
import { sanitizeChainName, upperCaseFirstChar } from '../util/utils';
import { useInfo } from '.';

interface PeopleChainInfo{
  peopleChain: Chain|undefined;
  endpoint: string|undefined;
}

export default function usePeopleChain (address: string | undefined, genesisHash?: string): PeopleChainInfo {
  const { chain } = useInfo(address);
  const _chain = chain || getChain(genesisHash);
  const _chainName = sanitizeChainName(_chain?.name);

  const peopleChain = useMemo(() => {
    const upperCasedChainName = upperCaseFirstChar(_chainName || '');

    return upperCasedChainName
      ? PEOPLE_CHAINS.includes(upperCasedChainName)
        ? { name: `${upperCasedChainName}People` }
        : _chain
      : undefined;
  }
  , [_chainName, _chain]);

  const maybeEndpoint = useMemo(() => {
    const peopleChainName = peopleChain?.name as string;

    if (!peopleChainName) {
      return;
    }

    const allEndpoints = createWsEndpoints(() => '');

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === peopleChainName?.toLowerCase() || String(e.info)?.toLowerCase() === peopleChainName?.toLowerCase());

    return endpoints?.length ? endpoints[0].value : undefined;
  }, [peopleChain]);

  return { endpoint: maybeEndpoint, peopleChain };
}
