// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { DeriveStakerReward } from '@polkadot/api-derive/types';

import { useApi, useFormatted } from '.';

export default function usePendingRewards(address: string): DeriveStakerReward[] | undefined {
  const api = useApi(address);
  const formatted = useFormatted(address);
  const [rewards, setRewards] = useState<DeriveStakerReward[]>();

  useEffect(() => {
    if (!api?.derive?.staking?.erasHistoric || !formatted) {
      return;
    }

    api.derive.staking.erasHistoric().then((eraHistoric) => {
      api.derive.staking?.stakerRewardsMultiEras([formatted], eraHistoric).then((stakerRewards) => {
        console.log(' stakerRewards', stakerRewards);
        setRewards(stakerRewards[0]);
      }).catch(console.error);
    }).catch(console.error);
  }, [address, api, formatted]);

  return rewards;
}
