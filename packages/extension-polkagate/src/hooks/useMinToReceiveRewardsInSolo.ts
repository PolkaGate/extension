// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useApi, useToken } from '.';

export default function useMinToReceiveRewardsInSolo(address: string): BN | undefined {
  const api = useApi(address);
  const token = useToken(address);
  const tokenFromApi = api && api.registry.chainTokens[0];

  const [min, setMin] = useState<BN | undefined>();

  useEffect(() => {
    if (!api || !token || !tokenFromApi || token !== tokenFromApi) {
      return setMin(undefined);
    }

    api.query.staking.minimumActiveStake().then((min) => {
      setMin(new BN(min.toString()));
    }).catch(console.error);
  }, [api, token, tokenFromApi]);

  return min;
}
