// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { createWsEndpoints } from '@polkagate/apps-config';
import { useMemo } from 'react';

import { KUSAMA_PEOPLE_GENESIS_HASH, PASEO_GENESIS_HASH, POLKADOT_PEOPLE_GENESIS_HASH, RELAY_CHAINS_NAMES, WESTEND_PEOPLE_GENESIS_HASH } from '../util/constants';
import { sanitizeChainName } from '../util/utils';
import useChainInfo from './useChainInfo';
import useMetadata from './useMetadata';

interface PeopleChainInfo {
  peopleChain: Chain | null | undefined;
  endpoint: string | undefined;
}
/**
 * @description To provide people chain if its already available for that chain
 * @param genesisHash
 * @returns endpoint and chain
 */

const getPeopleChainGenesisHash = (chainName: string | undefined) => {
  const startWith = RELAY_CHAINS_NAMES.find((name) => chainName?.startsWith(name)) || undefined;

  switch (startWith) {
    case 'Westend':
      return WESTEND_PEOPLE_GENESIS_HASH;
    case 'Kusama':
      return KUSAMA_PEOPLE_GENESIS_HASH;
    case 'Polkadot':
      return POLKADOT_PEOPLE_GENESIS_HASH;
    case 'Paseo':
      return PASEO_GENESIS_HASH;
    default:
      return undefined;
  }
};

const allEndpoints = createWsEndpoints();

export default function usePeopleChain (genesisHash?: string): PeopleChainInfo {
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
