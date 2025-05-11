// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
import type { BalancesInfo, MyPoolInfo } from '../util/types';
import type { SessionIfo, UnstakingType } from './useSoloStakingInfo';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import usePool2 from './usePool2';
import { useBalances2, useChainInfo, usePoolConst, useStakingConsts2 } from '.';

/**
 * Calculates unstaking amounts and their respective release dates
 *
 * @param api - The Polkadot API instance
 * @param stakingAccount - User's staking account information
 * @returns Unstaking information including total and scheduled releases
 */
const getUnstakingAmount = async (api: ApiPromise | undefined, pool: MyPoolInfo | null): Promise<UnstakingType | undefined> => {
  if (!api || !pool) {
    return undefined;
  }

  const sessionProgress = await api.derive.session.progress();
  const sessionInfo = {
    currentEra: Number(sessionProgress.currentEra),
    eraLength: Number(sessionProgress.eraLength),
    eraProgress: Number(sessionProgress.eraProgress)
  } as SessionIfo;

  const toBeReleased = [];
  let unlockingAmount;
  let redeemAmount = BN_ZERO;

  if (sessionInfo) {
    unlockingAmount = BN_ZERO;

    if (pool?.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool === null
      for (const [era, unbondingPoint] of Object.entries(pool.member?.unbondingEras)) {
        const remainingEras = Number(era) - sessionInfo.currentEra;

        if (remainingEras < 0) {
          redeemAmount = redeemAmount.add(new BN(unbondingPoint as string));
        } else {
          const amount = new BN(unbondingPoint as string);

          unlockingAmount = unlockingAmount.add(amount);

          const secToBeReleased = (remainingEras * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }
  }

  return { redeemAmount, toBeReleased, unlockingAmount };
};

/**
 * Calculates the balance available for staking
 *
 * @param balances - Account balance information
 * @param stakingAccount - User's staking account information
 * @param unlockingAmount - Amount currently in the unlocking process
 * @returns The amount available to stake, or undefined if required data is missing
 */
const getAvailableToStake = (balances: BalancesInfo | undefined, pool: MyPoolInfo | null | undefined, sessionInfo: UnstakingType | undefined) => {
  if (!balances || !pool || !sessionInfo) {
    return undefined;
  }

  const staked = new BN(pool?.member?.points ?? 0);
  const redeemable = sessionInfo.redeemAmount ?? BN_ZERO;
  const unlockingAmount = sessionInfo.unlockingAmount ?? BN_ZERO;

  if (!balances?.freeBalance || !staked || (!sessionInfo.unlockingAmount && !sessionInfo.redeemAmount)) {
    return undefined;
  }

  const _availableToStake = balances.freeBalance.sub(staked).sub(unlockingAmount).sub(redeemable || BN_ZERO);

  // the reserved balance can be considered here as the amount which can be staked as well in solo,
  // but since pooled balance are migrating to the reserved balance. and also the pallet has issue to accept reserved,
  // hence it needs more workaround on it
  return bnMax(BN_ZERO, _availableToStake);
};

/**
 * Custom hook that provides solo staking information for a given address
 *
 * @param address - The account address to get staking info for
 * @param genesisHash - The chain's genesis hash to identify the network
 * @param refresh - refresh
 * @returns Consolidated staking information including available balance, rewards, and more
 */
export default function usePoolStakingInfo (address: string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>) {
  const { api } = useChainInfo(genesisHash);
  const balances = useBalances2(address, genesisHash, refresh, setRefresh);
  const pool = usePool2(address, genesisHash);
  const poolStakingConsts = usePoolConst(genesisHash);
  const stakingConsts = useStakingConsts2(genesisHash);

  const [sessionInfo, setSessionInfo] = useState<UnstakingType | undefined>(undefined);

  // Fetch session and unstaking information
  const fetchSessionInfo = useCallback(async () => {
    if (pool === undefined) {
      return;
    }

    const info = await getUnstakingAmount(api, pool);

    setSessionInfo(info);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, pool, refresh]);

  // Update session info whenever dependencies change
  useEffect(() => {
    // if (pool === undefined) {
    //   return;
    // }

    fetchSessionInfo().catch(console.error);
  }, [fetchSessionInfo, pool]);

  const availableBalanceToStake = getAvailableToStake(balances, pool, sessionInfo);

  return {
    availableBalanceToStake,
    pool,
    poolStakingConsts,
    sessionInfo,
    stakingConsts
  };
}
