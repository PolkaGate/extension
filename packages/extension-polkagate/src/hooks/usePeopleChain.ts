// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { PEOPLE_CHAINS } from '../util/constants';
import getChainName from '../util/getChainName';
import { upperCaseFirstChar } from '../util/utils';
import { useInfo } from '.';

export default function usePeopleChain (address: string | undefined, genesisHash?: string): Chain | undefined {
  const { chain, chainName } = useInfo(address);

  return useMemo(() => {
    const _chainName = chainName || getChainName(genesisHash);

    const upperCasedChainName = upperCaseFirstChar(_chainName || '');

    return upperCasedChainName
      ? PEOPLE_CHAINS.includes(upperCasedChainName)
        ? { name: `${upperCasedChainName}People` }
        : chain
      : undefined;
  }
  , [chain, chainName, genesisHash]);
}
