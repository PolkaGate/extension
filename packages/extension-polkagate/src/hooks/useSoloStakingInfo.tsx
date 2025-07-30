// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { AccountStakingInfo, BalancesInfo, StakingConsts } from '../util/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import { BN_ZERO, bnMax } from '@polkadot/util';

import { getStorage, setStorage } from '../util';
import { isHexToBn } from '../util/utils';
import { useBalances2, useChainInfo, useCurrentEraIndex2, useStakingAccount2, useStakingConsts2, useStakingRewardDestinationAddress, useStakingRewards2 } from '.';

export interface SessionIfo {
  eraLength: number; // Length of an era in blocks
  eraProgress: number; // Current progress within the era
  currentEra: number; // Current era number
}

export interface DateAmount {
  date: number; // Timestamp when funds will be released
  amount: BN; // Amount to be released
}

export interface UnstakingType {
  toBeReleased: DateAmount[] | undefined; // Array of amounts with release dates
  unlockingAmount: BN | undefined; // Total amount in the unlocking process
  redeemAmount?: BN | undefined; // Total amount that is done with the unlocking process
}

export interface SoloStakingInfo {
  availableBalanceToStake: BN | undefined; // Amount available for staking
  rewardDestinationAddress: string | undefined; // Address for rewards
  rewards: BN | undefined; // Total rewards earned
  sessionInfo: UnstakingType | undefined; // Information about unstaking and release dates
  stakingAccount: AccountStakingInfo | null | undefined; // User's staking account information
  stakingConsts: StakingConsts | null | undefined; // Staking constants like minimum bond amount
}

interface SavedSoloStakingInfo extends SoloStakingInfo {
  currentEra: number;
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
          const amount = isHexToBn(value as unknown as string);

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

function reviveSoloStakingInfoBNs (info: SavedSoloStakingInfo): SavedSoloStakingInfo {
  return {
    ...info,
    availableBalanceToStake: info.availableBalanceToStake ? isHexToBn(info.availableBalanceToStake as unknown as string) : undefined,
    rewards: info.rewards ? isHexToBn(info.rewards as unknown as string) : undefined,
    sessionInfo: info.sessionInfo
      ? {
        toBeReleased: info.sessionInfo.toBeReleased?.map(({ amount, date }) => ({
          amount: isHexToBn(amount as unknown as string),
          date
        })),
        unlockingAmount: info.sessionInfo.unlockingAmount ? isHexToBn(info.sessionInfo.unlockingAmount as unknown as string) : undefined
      }
      : undefined,
    stakingAccount: info.stakingAccount
      ? {
        ...info.stakingAccount,
        redeemable: info.stakingAccount.redeemable ? isHexToBn(info.stakingAccount.redeemable as unknown as string) as Balance : undefined,
        stakingLedger: info.stakingAccount.stakingLedger
          ? {
            ...info.stakingAccount.stakingLedger,
            active: isHexToBn(info.stakingAccount.stakingLedger.active as unknown as string)
          }
          : undefined,
        unlocking: info.stakingAccount.unlocking
          ? Object.entries(info.stakingAccount.unlocking).reduce((acc, [k, v]) => {
          // @ts-ignore
            acc[k] = {
              ...v,
              remainingEras: isHexToBn(v.remainingEras as unknown as string),
              value: isHexToBn(v.value as unknown as string)
            };

            return acc;
          }, {} as typeof info.stakingAccount.unlocking)
          : undefined
      }
      : info.stakingAccount,
    stakingConsts: info.stakingConsts
      ? {
        ...info.stakingConsts,
        existentialDeposit: isHexToBn(info.stakingConsts?.existentialDeposit as unknown as string ?? '0'),
        minNominatorBond: isHexToBn(info.stakingConsts?.minNominatorBond as unknown as string ?? '0')
      }
      : info.stakingConsts
  };
}

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

const DEFAULT_VALUE = {
  availableBalanceToStake: undefined,
  rewardDestinationAddress: undefined,
  rewards: undefined,
  sessionInfo: undefined,
  stakingAccount: undefined,
  stakingConsts: undefined
};

/**
 * Custom hook that provides solo staking information for a given address
 *
 * @param address - The account address to get staking info for
 * @param genesisHash - The chain's genesis hash to identify the network
 * @param refresh - refresh
 * @returns Consolidated staking information including available balance, rewards, and more
 */
export default function useSoloStakingInfo (address: string | undefined, genesisHash: string | undefined, refresh?: boolean, setRefresh?: React.Dispatch<React.SetStateAction<boolean>>): SoloStakingInfo {
  const { api, chainName } = useChainInfo(genesisHash);
  const balances = useBalances2(address, genesisHash, refresh, setRefresh);
  const currentEra = useCurrentEraIndex2(genesisHash);

  const [soloStakingInfo, setSoloStakingInfo] = useState<SoloStakingInfo | undefined>(undefined);
  const [sessionInfo, setSessionInfo] = useState<UnstakingType | undefined>(undefined);

  // Tracks when we need to save to storage
  const needsStorageUpdate = useRef(false);
  // Tracks when it is done with fetching solo staking information
  const fetchingFlag = useRef(true);

  const stakingAccount = useStakingAccount2(address, genesisHash, refresh, setRefresh);

  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);
  const rewards = useStakingRewards2(chainName, stakingAccount); // total reward
  const stakingConsts = useStakingConsts2(genesisHash);

  // Fetch session and unstaking information
  const fetchSessionInfo = useCallback(async () => {
    const info = await getUnstakingAmount(api, stakingAccount);

    setSessionInfo(info);
    needsStorageUpdate.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, stakingAccount, refresh]);

  useEffect(() => {
    if (fetchingFlag.current) {
      fetchSessionInfo().catch(console.error);
    }
  }, [fetchSessionInfo]);

  const availableBalanceToStake = getAvailableToStake(balances, stakingAccount, sessionInfo?.unlockingAmount);

  // Separate effect for updating the state
  useEffect(() => {
    if (fetchingFlag.current && currentEra !== undefined && availableBalanceToStake && stakingAccount !== undefined && rewardDestinationAddress && genesisHash && address) {
      const info = {
        availableBalanceToStake,
        rewardDestinationAddress,
        rewards,
        sessionInfo,
        stakingAccount,
        stakingConsts
      };

      setSoloStakingInfo((pre) => ({
        ...pre,
        ...(Object.fromEntries(
          Object.entries(info).filter(([_, v]) => v !== undefined)
        ) as unknown as SoloStakingInfo)
      }));

      const allValuesPresent = Object.values(info).every((v) => v !== undefined);

      if (allValuesPresent) {
        fetchingFlag.current = false;
        needsStorageUpdate.current = true;
      }
    }
  }, [address, availableBalanceToStake, currentEra, genesisHash, rewardDestinationAddress, rewards, sessionInfo, stakingAccount, stakingConsts]);

  useEffect(() => {
    // Only save to storage when specifically needed
    if (needsStorageUpdate.current === true && fetchingFlag.current === false && soloStakingInfo && currentEra !== undefined && genesisHash && address) {
      const toSave = {
        ...soloStakingInfo,
        currentEra
      };

      const key = genesisHash + 'SoloStakingInfo' + address;

      setStorage(key, toSave, true)
        .then(() => {
          needsStorageUpdate.current = false;
        })
        .catch(console.error);
    }
  }, [soloStakingInfo, currentEra, genesisHash, address]);

  // Load from storage if needed
  useEffect(() => {
    if (!soloStakingInfo && genesisHash && address && currentEra !== undefined) {
      const key = genesisHash + 'SoloStakingInfo' + address;

      getStorage(key, true).then((parsed) => {
        const parsedInfo = parsed as SavedSoloStakingInfo;

        if (parsedInfo?.currentEra === currentEra) {
          const revived = reviveSoloStakingInfoBNs(parsedInfo);

          setSoloStakingInfo(revived);
          needsStorageUpdate.current = false;
        }
      }).catch(console.error);
    }
  }, [address, currentEra, genesisHash, soloStakingInfo]);

  return soloStakingInfo ?? DEFAULT_VALUE;
}
