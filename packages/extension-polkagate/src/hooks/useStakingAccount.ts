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
import { useAccount, useApi, useChain, useChainName, useFormatted, useStashId } from '.';

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
  const chain = useChain(address);
  const chainName = useChainName(address);
  const api = useApi(address);
  const stashId = useStashId(address);

  const [stakingInfo, setStakingInfo] = useState<AccountStakingInfo | null>();
  const token = api && api.registry.chainTokens[0];
  const decimal = api && api.registry.chainDecimals[0];

  const fetch = useCallback(async () => {
    if (!api || !stashId) {
      return;
    }

    const [accountInfo, era] = await Promise.all([
      api.derive.staking.account(stashId),
      api.query.staking.currentEra()
    ]);

    if (!accountInfo) {
      console.log('Can not fetch accountInfo!');

      return setStakingInfo(null);
    }

    const temp = { ...accountInfo };

    temp.stakingLedger.set('active', accountInfo.stakingLedger.active.unwrap());
    temp.stakingLedger.set('total', accountInfo.stakingLedger.total.unwrap());
    temp.accountId = temp.accountId.toString();
    temp.controllerId = temp.controllerId?.toString() || null;

    setStakingInfo({ ...temp, era: Number(era), date: Date.now(), decimal, token });
    refresh && setRefresh && setRefresh(false);
  }, [api, decimal, refresh, setRefresh, stashId, token]);

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
    if (!account || !stakingInfo || !chainName || !token || !decimal) {
      return;
    }

    console.log('stakingInfo in useStakingAccount, parsed:', JSON.parse(JSON.stringify(stakingInfo)));

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
    savedStakingAccount[chainName] = { ...temp, date: Date.now(), decimal, token };
    const metaData = JSON.stringify({ ['stakingAccount']: JSON.stringify(savedStakingAccount) });

    updateMeta(String(address), metaData).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, api, chain, chainName, stakingInfo, Object.keys(account ?? {})?.length, token, decimal]);

  useEffect(() => {
    if (!chainName || !account) {
      return;
    }

    const savedStakingAccount = JSON.parse(account?.stakingAccount ?? '{}');

    if (savedStakingAccount[chainName]) {
      const sa = savedStakingAccount[chainName] as AccountStakingInfo;

      sa.redeemable = new BN(sa.redeemable);
      sa.stakingLedger.active = new BN(sa.stakingLedger.active);
      sa.stakingLedger.total = new BN(sa.stakingLedger.total);
      sa.stakingLedger.unlocking = sa.stakingLedger?.unlocking?.map(({ value, era }) => ({ value: new BN(value), era: new BN(era) }));
      sa.unlocking = sa?.unlocking?.map(({ value, remainingEras }) => ({ value: new BN(value), remainingEras: new BN(remainingEras) }));

      setStakingInfo(sa);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(account ?? {})?.length, chainName]);

  return stakingInfo;
}
