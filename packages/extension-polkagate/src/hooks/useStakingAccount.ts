// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a 
 * */

import { useCallback, useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN } from '@polkadot/util';

import { updateMeta } from '../messaging';
import { AccountStakingInfo } from '../util/types';
import { isHexToBn } from '../util/utils';
import { useAccount, useApi, useStashId, useToken } from '.';

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
export default function useStakingAccount(address: AccountId | string | undefined, stateInfo?: AccountStakingInfo, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>): AccountStakingInfo | null | undefined {
  const account = useAccount(address);
  const api = useApi(address);
  const stashId = useStashId(address);
  const addressCurrentToken = useToken(address);
  const [stakingInfo, setStakingInfo] = useState<AccountStakingInfo | null>();

  const fetch = useCallback(async () => {
    if (!api || !stashId) {
      return;
    }

    if (!api.derive.staking) {
      // console.log('no staking on this chain');

      return setStakingInfo(null);
    }

    const [accountInfo, era, fetchedToken, fetchedDecimal] = await Promise.all([
      api.derive.staking.account(stashId),
      api.query.staking.currentEra(),
      api.registry.chainTokens[0],
      api.registry.chainDecimals[0]
    ]);

    if (!accountInfo) {
      console.log('Can not fetch accountInfo!');

      return setStakingInfo(null);
    }

    const temp = { ...accountInfo };

    temp.stakingLedger.set('active', isHexToBn(String(accountInfo.stakingLedger.active)));
    temp.stakingLedger.set('total', isHexToBn(String(accountInfo.stakingLedger.total)));
    temp.accountId = temp.accountId.toString();
    temp.controllerId = temp.controllerId?.toString() || null;
    temp.stashId = temp.stashId.toString();
    temp.token = fetchedToken;
    temp.rewardDestination = JSON.parse(JSON.stringify(temp.rewardDestination));

    fetchedToken === addressCurrentToken && setStakingInfo({ ...temp, date: Date.now(), decimal: fetchedDecimal, era: Number(era), genesisHash: api.genesisHash.toString() });
    refresh && setRefresh && setRefresh(false);
  }, [addressCurrentToken, api, refresh, setRefresh, stashId]);

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

  useEffect(() => {
    if (!account || !stakingInfo || !stakingInfo.token || addressCurrentToken !== stakingInfo.token || stakingInfo?.genesisHash !== account?.genesisHash) {
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
    temp.redeemable = stakingInfo.redeemable.toString();
    temp.rewardDestination = stakingInfo.rewardDestination;
    temp.stakingLedger = {};
    temp.stakingLedger.active = stakingInfo.stakingLedger.active.toString();
    temp.stakingLedger.total = stakingInfo.stakingLedger.total.toString();
    temp.stakingLedger.stash = stakingInfo.stakingLedger.stash;
    temp.stakingLedger.unlocking = stakingInfo.stakingLedger?.unlocking?.map(({ value, era }) => ({ value: value.toString(), era: era.toString() }));
    temp.stashId = stakingInfo.stashId;
    temp.token = stakingInfo.token;
    temp.unlocking = stakingInfo?.unlocking?.map(({ value, remainingEras }) => ({ value: value.toString(), remainingEras: remainingEras.toString() }));
    temp.validatorPrefs = stakingInfo.validatorPrefs;

    // load save balances of different chains
    const savedStakingAccount = JSON.parse(account?.stakingAccount ?? '{}') as AccountStakingInfo;

    // add this chain balances
    savedStakingAccount[stakingInfo.token] = { ...temp, date: Date.now() };
    const metaData = JSON.stringify({ ['stakingAccount']: JSON.stringify(savedStakingAccount) });

    updateMeta(String(address), metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, api, stakingInfo, Object.keys(account ?? {})?.length]);

  useEffect(() => {
    if (!account || !addressCurrentToken) {
      return;
    }

    const savedStakingAccount = JSON.parse(account?.stakingAccount ?? '{}');

    if (savedStakingAccount[addressCurrentToken]) {
      const sa = savedStakingAccount[addressCurrentToken] as AccountStakingInfo;

      sa.redeemable = new BN(sa.redeemable);
      sa.stakingLedger.active = new BN(sa.stakingLedger.active);
      sa.stakingLedger.total = new BN(sa.stakingLedger.total);
      sa.stakingLedger.unlocking = sa.stakingLedger?.unlocking?.map(({ era, value }) => ({ era: new BN(era), value: new BN(value) }));
      sa.unlocking = sa?.unlocking?.map(({ value, remainingEras }) => ({ remainingEras: new BN(remainingEras), value: new BN(value) }));

      setStakingInfo(sa);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, addressCurrentToken]);

  return stakingInfo && stakingInfo.token === addressCurrentToken
    ? stakingInfo
    : undefined;
}
