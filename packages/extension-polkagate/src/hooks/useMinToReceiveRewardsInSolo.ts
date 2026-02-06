// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import useChainInfo from './useChainInfo';

export default function useMinToReceiveRewardsInSolo(genesisHash: string | undefined): BN | undefined {
   const { api, token } = useChainInfo(genesisHash);
  const tokenFromApi = api?.registry.chainTokens[0];

  const [min, setMin] = useState<BN | undefined>();

  useEffect(() => {
    if (!api || !token || !tokenFromApi || token !== tokenFromApi) {
      return setMin(undefined);
    }

    api.query['staking']['minimumActiveStake']().then((min) => {
      setMin(new BN(min.toString()));
    }).catch(console.error);
  }, [api, token, tokenFromApi]);

  return min;
}
