// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a 
 * */


import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountStakingInfo } from '../util/types';
import { useApi } from '.';

export default function useStakingAccount(
  stashId: AccountId | undefined,
  stateInfo?: AccountStakingInfo,
  refresh?: boolean | undefined,
  setRefresh?: React.Dispatch<React.SetStateAction<boolean | undefined>>
): AccountStakingInfo | undefined {
  const [stakingInfo, setStakingInfo] = useState<AccountStakingInfo>();
  const api = useApi(stashId);

  const fetch = useCallback(async () => {
    if (!api || !stashId) {
      return;
    }

    const [accountInfo, era] = await Promise.all([
      api.derive.staking.account(stashId),
      api.query.staking.currentEra()
    ]);

    setStakingInfo({ ...accountInfo, era: Number(era) });
    refresh && setRefresh && setRefresh(false);
  }, [api, refresh, setRefresh, stashId]);

  useEffect(() => {
    if (stateInfo) {
      return setStakingInfo(stateInfo);
    }

    if (!api) {
      return;
    }

    fetch().catch(console.error);
  }, [api, fetch, stashId, stateInfo]);

  useEffect(() => {
    if (!api) {
      return;
    }

    refresh && fetch().catch(console.error);
  }, [api, fetch, refresh, stashId, stateInfo]);

  return stakingInfo;
}
