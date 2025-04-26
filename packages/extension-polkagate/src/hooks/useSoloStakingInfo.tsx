// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountStakingInfo, BalancesInfo, StakingConsts } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { useBalances2, useChainInfo, useStakingAccount2, useStakingConsts2, useStakingRewardDestinationAddress, useStakingRewards } from '.';

interface SessionIfo {
  eraLength: number; // Length of an era in blocks
  eraProgress: number; // Current progress within the era
  currentEra: number; // Current era number
}

export interface DateAmount {
  date: number; // Timestamp when funds will be released
  amount: BN; // Amount to be released
}

interface UnstakingType {
  toBeReleased: DateAmount[] | undefined; // Array of amounts with release dates
  unlockingAmount: BN | undefined; // Total amount in the unlocking process
}

export interface SoloStakingInfo {
  availableBalanceToStake: BN | undefined; // Amount available for staking
  rewardDestinationAddress: string | undefined; // Address for rewards
  rewards: BN | undefined; // Total rewards earned
  sessionInfo: UnstakingType | undefined; // Information about unstaking and release dates
  stakingAccount: AccountStakingInfo | null | undefined; // User's staking account information
  stakingConsts: StakingConsts | null | undefined; // Staking constants like minimum bond amount
}

/**
 * Calculates unstaking amounts and their respective release dates
 *
 * @param api - The Polkadot API instance
 * @param stakingAccount - User's staking account information
 * @returns Unstaking information including total and scheduled releases
 */
const getUnstakingAmount = async (api: ApiPromise | undefined, stakingAccount: AccountStakingInfo | null | undefined): Promise<UnstakingType | undefined> => {
  if (!api || !stakingAccount) {
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

  if (sessionInfo) {
    unlockingAmount = BN_ZERO;

    if (stakingAccount.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as unknown as string);

          unlockingAmount = unlockingAmount.add(amount);
          // Calculate release time in seconds, then convert to milliseconds for timestamp
          const secToBeReleased = (Number(remainingEras.subn(1)) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

          toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
        }
      }
    }
  }

  return { toBeReleased, unlockingAmount };
};

/**
 * Calculates the balance available for staking
 *
 * @param balances - Account balance information
 * @param stakingAccount - User's staking account information
 * @param unlockingAmount - Amount currently in the unlocking process
 * @returns The amount available to stake, or undefined if required data is missing
 */
const getAvailableToStake = (balances: BalancesInfo | undefined, stakingAccount: AccountStakingInfo | null | undefined, unlockingAmount: BN | undefined) => {
  if (!balances || !stakingAccount || !unlockingAmount) {
    return undefined;
  }

  const staked = stakingAccount?.stakingLedger?.active as unknown as BN;
  const redeemable = stakingAccount?.redeemable;

  if (!balances?.freeBalance || !staked || !unlockingAmount) {
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
 * @returns Consolidated staking information including available balance, rewards, and more
 */
export default function useSoloStakingInfo (address: string | undefined, genesisHash: string | undefined) {
  const { api } = useChainInfo(genesisHash);
  const balances = useBalances2(address, genesisHash);

  const [sessionInfo, setSessionInfo] = useState<UnstakingType | undefined>(undefined);

  const stakingAccount = useStakingAccount2(address, genesisHash);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);
  const rewards = useStakingRewards(address, stakingAccount);
  const stakingConsts = useStakingConsts2(genesisHash);

  // Fetch session and unstaking information
  const fetchSessionInfo = useCallback(async () => {
    const info = await getUnstakingAmount(api, stakingAccount);

    setSessionInfo(info);
  }, [api, stakingAccount]);

  // Update session info whenever dependencies change
  useEffect(() => {
    fetchSessionInfo().catch(console.error);
  }, [fetchSessionInfo]);

  const availableBalanceToStake = getAvailableToStake(balances, stakingAccount, sessionInfo?.unlockingAmount);

  return {
    availableBalanceToStake,
    rewardDestinationAddress,
    rewards,
    sessionInfo,
    stakingAccount,
    stakingConsts
  };
}
