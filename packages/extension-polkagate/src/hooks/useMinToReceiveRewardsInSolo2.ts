// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import { useEffect, useMemo, useState } from 'react';

import { BN, bnMax } from '@polkadot/util';

import { useApi, useStakingConsts, useToken } from '.';

export default function useMinToReceiveRewardsInSolo2 (address: string | undefined): BN | undefined {
  const api = useApi(address);
  const token = useToken(address);
  const stakingConsts = useStakingConsts(address);

  const tokenFromApi = api?.registry.chainTokens[0];

  const [minimumActiveStake, setMinimumActiveStake] = useState<BN | undefined>();

  useEffect(() => {
    if (!api || !token || !tokenFromApi || token !== tokenFromApi) {
      return undefined;
    }

    api.query.staking.minimumActiveStake().then((min) => {
      setMinimumActiveStake(new BN(min.toString()));
    }).catch(console.error);
  }, [api, token, tokenFromApi]);

  return useMemo(() => {
    if (!stakingConsts || !minimumActiveStake) {
      return undefined;
    }

    return bnMax(new BN(stakingConsts.minNominatorBond.toString()), new BN(stakingConsts?.existentialDeposit.toString()), minimumActiveStake);
  }, [minimumActiveStake, stakingConsts]);
}
