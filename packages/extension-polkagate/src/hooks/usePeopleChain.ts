// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { KUSAMA_PEOPLE_GENESIS_HASH, POLKADOT_GENESIS_HASH, WESTEND_PEOPLE_GENESIS_HASH } from '../util/constants';
import getChain from '../util/getChain';
import { sanitizeChainName } from '../util/utils';
import { useInfo, useMetadata } from '.';

interface PeopleChainInfo {
  peopleChain: Chain | null | undefined;
  endpoint: string | undefined;
}
/**
 * @description To provide people chain if its already available for that chain
 * @param address
 * @param genesisHash
 * @returns endpoint and chain
 */

const getPeopleChainGenesisHash = (chainName: string | undefined) => {
  switch (chainName) {
    case 'Westend':
    case 'WestendPeople':
      return WESTEND_PEOPLE_GENESIS_HASH;
    case 'Kusama':
    case 'KusamaPeople':
      return KUSAMA_PEOPLE_GENESIS_HASH;
    case 'Polkadot':
    case 'PolkadotPeople':
      return POLKADOT_GENESIS_HASH; // should be changed to POLKADOT_PEOPLE_GENESIS_HASH in the future
    default:
      return undefined;
  }
};

export default function usePeopleChain (address: string | undefined, genesisHash?: string): PeopleChainInfo {
  const { chain } = useInfo(address);
  const _chain = chain || getChain(genesisHash);
  const _chainName = sanitizeChainName(_chain?.name);
  const peopleChainGenesisHash = getPeopleChainGenesisHash(_chainName);

  const peopleChain = useMetadata(peopleChainGenesisHash, true);

  const maybeEndpoint = useMemo(() => {
    const peopleChainName = sanitizeChainName(peopleChain?.name as string);

    if (!peopleChainName) {
      return;
    }

    const allEndpoints = createWsEndpoints(() => '');

    const endpoints = allEndpoints?.filter((e) => String(e.text)?.toLowerCase() === peopleChainName?.toLowerCase() || String(e.info)?.toLowerCase() === peopleChainName?.toLowerCase());

    return endpoints?.length ? endpoints[0].value : undefined;
  }, [peopleChain]);

  return {
    endpoint: maybeEndpoint,
    peopleChain
  };
}
