// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
import type { BN } from '@polkadot/util';
import type { BalancesInfo, MyPoolInfo, PoolStakingConsts, StakingConsts } from '../util/types';
import type { UnstakingType } from './useSoloStakingInfo';

import { useCallback, useEffect, useState } from 'react';

import { BN_ZERO, bnMax } from '@polkadot/util';

import { toBN } from '../util';
import { getEraInfo } from './utils/getEraInfo';
import { getReleaseDate } from './utils/getReleaseDate';
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

  const { blockTime, currentEra, eraLength, eraProgress } = await getEraInfo(api);

  const toBeReleased = [];
  let unlockingAmount;
  let redeemAmount = BN_ZERO;

  if (currentEra) {
    unlockingAmount = BN_ZERO;

    if (pool?.member?.unbondingEras) { // if pool is fetched but account belongs to no pool then pool === null
      for (const [era, value] of Object.entries(pool.member?.unbondingEras)) {
        const remainingEras = toBN(era).subn(currentEra);
        const amount = toBN(value);

        if (remainingEras.ltn(0)) {
          redeemAmount = redeemAmount.add(amount);
        } else {
          unlockingAmount = unlockingAmount.add(amount);

          const date = getReleaseDate(remainingEras, eraLength, eraProgress, blockTime);

          toBeReleased.push({ amount, date });
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
