// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { PEOPLE_CHAINS, PEOPLE_CHAINS_GENESIS_HASHES } from '../util/constants';
import getChain from '../util/getChain';
import { sanitizeChainName, upperCaseFirstChar } from '../util/utils';
import { useInfo } from '.';

interface PeopleChainInfo {
  peopleChain: Chain | undefined;
  endpoint: string | undefined;
}
/**
 * @description To provide people chain if its already available for that chain
 * @param address
 * @param genesisHash
 * @returns endpoint and chain
 */

export default function usePeopleChain (address: string | undefined, genesisHash?: string): PeopleChainInfo {
  const { chain } = useInfo(address);
  const _chain = chain || getChain(genesisHash);
  const _chainName = sanitizeChainName(_chain?.name);

  const peopleChain = useMemo((): Chain | undefined => {
    const upperCasedChainName = upperCaseFirstChar(_chainName || '');

    if (upperCasedChainName) {
      if (PEOPLE_CHAINS.includes(upperCasedChainName)) {
        const index = upperCasedChainName === 'Westend' ? 0 : 1;

        const selectedGenesisHash = PEOPLE_CHAINS_GENESIS_HASHES[index];

        return {
          genesisHash: selectedGenesisHash,
          name: `${upperCasedChainName}People`
        } as Chain;
      } else {
        return _chain;
      }
    } else {
      return undefined;
    }
  }, [_chainName, _chain]);

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
