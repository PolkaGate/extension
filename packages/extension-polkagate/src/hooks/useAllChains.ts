// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { UserAddedChainContext } from '../components';
import chains, { type NetworkInfo } from '../util/chains';

export default function useAllChains (): NetworkInfo[] {
  const userAddedChainCtx = useContext(UserAddedChainContext);

  return useMemo(() => {
    let temp: NetworkInfo[] = [];

    if (userAddedChainCtx) {
      temp = Object.entries(userAddedChainCtx)
        .map(([genesisHash, data]) => (
          {
            genesisHash,
            ...data
          })) as unknown as NetworkInfo[];
    }

    return chains.concat(temp);
  }, [userAddedChainCtx]);
}
