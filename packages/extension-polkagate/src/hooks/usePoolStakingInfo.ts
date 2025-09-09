// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
import type { BalancesInfo, MyPoolInfo, PoolStakingConsts, StakingConsts } from '../util/types';
import type { SessionIfo, UnstakingType } from './useSoloStakingInfo';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import useBalances from './useBalances';
import useChainInfo from './useChainInfo';
import usePool from './usePool';
import usePoolConst from './usePoolConst';
import useStakingConsts from './useStakingConsts';

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
 * @returns The amount available to stake, or undefined if required data is missing
 */
const getAvailableToStake = (balances: BalancesInfo | undefined) => {
  if (!balances?.freeBalance) {
    return undefined;
  }

  const _availableToStake = balances.freeBalance;

  return bnMax(BN_ZERO, _availableToStake);
};

export interface PoolStakingInfo {
  availableBalanceToStake: BN | undefined;
  pool: MyPoolInfo | null | undefined;
  poolStakingConsts: PoolStakingConsts | null | undefined;
  sessionInfo: UnstakingType | undefined;
  stakingConsts: StakingConsts | null | undefined;
}

/**
 * Custom hook that provides solo staking information for a given address
 *
 * @param address - The account address to get staking info for
 * @param genesisHash - The chain's genesis hash to identify the network
 * @param refresh - refresh
 * @returns Consolidated staking information including available balance, rewards, and more
 */
export default function usePoolStakingInfo (address: string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>): PoolStakingInfo {
  const { api } = useChainInfo(genesisHash);
  const balances = useBalances(address, genesisHash, refresh, setRefresh);
  const pool = usePool(address, genesisHash, undefined, refresh, setRefresh);
  const poolStakingConsts = usePoolConst(genesisHash);
  const stakingConsts = useStakingConsts(genesisHash);

  const [sessionInfo, setSessionInfo] = useState<UnstakingType | undefined>(undefined);

  // Fetch session and unstaking information
  const fetchSessionInfo = useCallback(async () => {
    if (pool === undefined) {
      return;
    }

    const info = await getUnstakingAmount(api, pool);

    setSessionInfo(info);
  }, [api, pool]);

  // Update session info whenever dependencies change
  useEffect(() => {
    fetchSessionInfo().catch(console.error);
  }, [fetchSessionInfo, pool]);

  const availableBalanceToStake = getAvailableToStake(balances);

  return {
    availableBalanceToStake,
    pool,
    poolStakingConsts,
    sessionInfo,
    stakingConsts
  };
}
