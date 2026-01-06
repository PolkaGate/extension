// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
// @ts-ignore
import type { PalletStakingRewardDestination } from '@polkadot/types/lookup';
import type { Codec } from '@polkadot/types/types';
import type { AccountStakingInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { isHexToBn } from '../util';
import useChainInfo from './useChainInfo';
import useStashId from './useStashId';

BN.prototype.toJSON = function () {
  return this.toString();
};

/**
 * @description get all staking info for an account in solo staking
 *
 * @param stashId
 * @param stateInfo
 * @param refresh
 * @param setRefresh
 * @returns account staking Info
 */
export default function useStakingAccount(address: AccountId | string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>): AccountStakingInfo | null | undefined {
  const { api, decimal, token } = useChainInfo(genesisHash);
  const stashId = useStashId(address, genesisHash);

  const [stakingInfo, setStakingInfo] = useState<AccountStakingInfo | null | undefined>(undefined);

  const fetch = useCallback(async () => {
    if (!api || !stashId || !token || !decimal) {
      return;
    }

    if (!api.derive.staking) {
      return setStakingInfo(null);
    }

    const [accountInfo, era] = await Promise.all([
      api.derive.staking.account(stashId),
      api.query['staking']['currentEra']()
    ]);

    if (!accountInfo) {
      console.log('Can not fetch accountInfo!');

      return setStakingInfo(null);
    }

    const temp = { ...accountInfo, token: '' as string };

    temp.stakingLedger.set('active', isHexToBn(String(accountInfo.stakingLedger.active)) as unknown as Codec);
    temp.stakingLedger.set('total', isHexToBn(String(accountInfo.stakingLedger.total)) as unknown as Codec);
    temp.accountId = temp.accountId.toString() as unknown as AccountId;
    temp.controllerId = temp.controllerId?.toString() as unknown as AccountId || null;
    temp.stashId = temp.stashId.toString() as unknown as AccountId;
    temp.token = token;
    temp.rewardDestination = JSON.parse(JSON.stringify(temp.rewardDestination)) as PalletStakingRewardDestination;

    setStakingInfo({ ...temp, date: Date.now(), decimal, era: Number(era), genesisHash });
    refresh && setRefresh?.(false);
  }, [api, stashId, token, decimal, genesisHash, refresh, setRefresh]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (refresh) {
      setStakingInfo(undefined);
    }

    fetch().catch(console.error);
  }, [api, fetch, refresh, stashId]);

  return stakingInfo;
}
