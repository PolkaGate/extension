// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { PEOPLE_CHAINS } from '../util/constants';
import { useInfo } from '.';

export default function usePeopleChain (address: string | undefined): Chain | undefined {
  const { chain, chainName } = useInfo(address);

  return useMemo(() =>
    chainName
      ? PEOPLE_CHAINS.includes(chainName)
        ? { name: `${chainName}People` }
        : chain
      : undefined
  , [chain, chainName]);
}
