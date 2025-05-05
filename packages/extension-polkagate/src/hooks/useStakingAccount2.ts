// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { PalletStakingRewardDestination } from '@polkadot/types/lookup';
import type { Codec } from '@polkadot/types/types';
import type { AbstractInt } from '@polkadot/types-codec';
import type { AccountStakingInfo } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN } from '@polkadot/util';

import { updateMeta } from '../messaging';
import { isHexToBn } from '../util/utils';
import { useChainInfo, useSelectedAccount, useStashId2 } from '.';

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
export default function useStakingAccount2 (address: AccountId | string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>, onlyNew?: boolean): AccountStakingInfo | null | undefined {
  const { api, decimal, token } = useChainInfo(genesisHash);
  const account = useSelectedAccount();
  const stashId = useStashId2(address, genesisHash);

  const [stakingInfo, setStakingInfo] = useState<AccountStakingInfo | null>();

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

    fetch().catch(console.error);
  }, [api, fetch, stashId]);

  useEffect(() => {
    if (!api) {
      return;
    }

    refresh && fetch().catch(console.error);
  }, [api, fetch, refresh, stashId]);

  useEffect(() => {
    if (!account || !stakingInfo?.token || token !== stakingInfo.token || stakingInfo?.genesisHash !== account?.genesisHash) {
      return;
    }

    // console.log('stakingInfo in useStakingAccount, parsed:', JSON.parse(JSON.stringify(stakingInfo)));

    const temp = {} as AccountStakingInfo;

    temp.accountId = stakingInfo.accountId;
    temp.controllerId = stakingInfo.controllerId;
    temp.date = stakingInfo.date;
    temp.decimal = stakingInfo.decimal;
    temp.era = stakingInfo.era;
    temp.nominators = stakingInfo.nominators;
    temp.redeemable = stakingInfo.redeemable?.toString() as unknown as AbstractInt;
    temp.rewardDestination = stakingInfo.rewardDestination;
    temp.stakingLedger = {};
    temp.stakingLedger.active = stakingInfo.stakingLedger.active.toString();
    temp.stakingLedger.total = stakingInfo.stakingLedger.total.toString();
    temp.stakingLedger.stash = stakingInfo.stakingLedger.stash;
    temp.stakingLedger.unlocking = stakingInfo.stakingLedger?.unlocking?.map(({ era, value }) => ({ value: value.toString(), era: era.toString() }));
    temp.stashId = stakingInfo.stashId;
    temp.token = stakingInfo.token;
    temp.unlocking = stakingInfo?.unlocking?.map(({ remainingEras, value }) => ({ remainingEras: remainingEras.toString(), value: value.toString() }));
    temp.validatorPrefs = stakingInfo.validatorPrefs;

    // load save balances of different chains
    const savedStakingAccount = JSON.parse(account?.stakingAccount ?? '{}') as AccountStakingInfo;

    // add this chain balances
    savedStakingAccount[stakingInfo.token] = { ...temp, date: Date.now() };
    const metaData = JSON.stringify({ stakingAccount: JSON.stringify(savedStakingAccount) });

    updateMeta(String(address), metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, api, stakingInfo, Object.keys(account ?? {})?.length]);

  useEffect(() => {
    if (!account || !token || onlyNew) {
      return;
    }

    const savedStakingAccount = JSON.parse(account?.stakingAccount ?? '{}');

    if (savedStakingAccount[token]) {
      const sa = savedStakingAccount[token] as AccountStakingInfo;

      sa.redeemable = new BN(sa.redeemable);
      sa.stakingLedger.active = new BN(sa.stakingLedger.active);
      sa.stakingLedger.total = new BN(sa.stakingLedger.total);
      sa.stakingLedger.unlocking = sa.stakingLedger?.unlocking?.map(({ era, value }) => ({ era: new BN(era), value: new BN(value) }));
      sa.unlocking = sa?.unlocking?.map(({ remainingEras, value }) => ({ remainingEras: new BN(remainingEras), value: new BN(value) }));

      setStakingInfo(sa);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, token, onlyNew]);

  return stakingInfo;
}
