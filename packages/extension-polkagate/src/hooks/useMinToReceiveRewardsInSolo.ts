// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { useApi } from '.';

export default function useMinToReceiveRewardsInSolo(address: string): BN | undefined {
  const api = useApi(address);

  const [min, setMin] = useState<BN | undefined>();

  useEffect(() => {
    api && api.query.staking.minimumActiveStake().then((min) => {
      setMin(new BN(min.toString()));
    }).catch(console.error);
  }, [api]);

  return min;
}
