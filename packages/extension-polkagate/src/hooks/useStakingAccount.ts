// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a 
 * */

import type { DeriveStakingAccount } from '@polkadot/api-derive/types';

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountStakingInfo } from '../util/types';
import { useApi } from '.';

export default function useStakingAccount(stashId: AccountId | undefined, stateInfo?: AccountStakingInfo): AccountStakingInfo | undefined {
  const [stakingInfo, setStakingInfo] = useState<AccountStakingInfo>();
  const api = useApi(stashId);

  useEffect(() => {
    if (stateInfo) {
      return setStakingInfo(stateInfo);
    }

    if (!api) {
      return;
    }

    async function fetch() {
      const [accountInfo, era] = await Promise.all([
        api.derive.staking.account(stashId),
        api.query.staking.currentEra()
      ]);

      setStakingInfo({ ...accountInfo, era: Number(era) });
    }

    fetch().catch(console.error);
  }, [api, stashId, stateInfo]);

  return stakingInfo;
}
