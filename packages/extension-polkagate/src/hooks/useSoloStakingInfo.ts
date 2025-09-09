// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { AccountStakingInfo, StakingConsts } from '../util/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { getStorage, setStorage } from '../util';
import { isHexToBn } from '../util/utils';
import useBalances from './useBalances';
import useChainInfo from './useChainInfo';
import useCurrentEraIndex from './useCurrentEraIndex';
import useSoloStakingTotalReward from './useSoloStakingTotalReward';
import useStakingAccount from './useStakingAccount';
import useStakingConsts from './useStakingConsts';
import useStakingRewardDestinationAddress from './useStakingRewardDestinationAddress';

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

function reviveSoloStakingInfoBNs(info: SavedSoloStakingInfo): SavedSoloStakingInfo {
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
  const { api, chainName, token } = useChainInfo(genesisHash);
  const balances = useBalances(address, genesisHash);
  const currentEra = useCurrentEraIndex(genesisHash);
  const stakingAccount = useStakingAccount(address, genesisHash, refresh, setRefresh);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);
  const rewards = useSoloStakingTotalReward(chainName, stakingAccount); // total reward
  const stakingConsts = useStakingConsts(genesisHash);

  const [soloStakingInfoLoaded, setSoloStakingInfoLoaded] = useState<SoloStakingInfo | undefined>(undefined);
  const [soloStakingInfo, setSoloStakingInfo] = useState<SoloStakingInfo | undefined>(undefined);
  const [sessionInfo, setSessionInfo] = useState<UnstakingType | undefined>(undefined);

  // Tracks when we need to save to storage
  const needsStorageUpdate = useRef(false);
  // Tracks when it is done with fetching solo staking information
  const fetchingFlag = useRef(true);
  // Tracks when it is done with fetching rewards
  const rewardsFetchingFlag = useRef(true);

  useEffect(() => {
    if (refresh) {
      fetchingFlag.current = true;
      setSoloStakingInfo(undefined);
      setSessionInfo(undefined);
    }
  }, [refresh]);

  // Fetch session and unstaking information
  const fetchSessionInfo = useCallback(async () => {
    const info = await getUnstakingAmount(api, stakingAccount);

    setSessionInfo(info);
    needsStorageUpdate.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api?.genesisHash, stakingAccount, refresh]);

  useEffect(() => {
    if (fetchingFlag.current && !sessionInfo) {
      fetchSessionInfo().catch(console.error);
    }
  }, [fetchSessionInfo, sessionInfo]);

  // Separate effect for updating the state
  useEffect(() => {
    if (fetchingFlag.current === false || currentEra === undefined || !balances || !stakingAccount || !sessionInfo || !rewardDestinationAddress || !genesisHash || !address || refresh) {
      return;
    }

    const info = {
      availableBalanceToStake: balances.freeBalance,
      rewardDestinationAddress,
      rewards,
      sessionInfo,
      stakingAccount,
      stakingConsts
    };

    const nonUndefinedInfo = Object.fromEntries(
      Object.entries(info).filter(([_, v]) => v !== undefined)
    );

    setSoloStakingInfo((pre) => ({ ...pre, ...nonUndefinedInfo }) as SoloStakingInfo);
  }, [address, balances, currentEra, genesisHash, rewardDestinationAddress, rewards, sessionInfo, stakingAccount, stakingConsts, refresh]);

  useEffect(() => {
    if (rewards && soloStakingInfo && rewardsFetchingFlag.current) {
      rewardsFetchingFlag.current = false;
      setSoloStakingInfo((pre) => ({ ...pre, rewards }) as SoloStakingInfo);
    }
  }, [rewards, soloStakingInfo]);

  // Update rewards separately as they might come later
  useEffect(() => {
    if (soloStakingInfo && fetchingFlag.current) {
      fetchingFlag.current = false;
      needsStorageUpdate.current = true;
    }
  }, [soloStakingInfo]);

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

          setSoloStakingInfoLoaded(revived);
          needsStorageUpdate.current = false;
        }
      }).catch(console.error);
    }
  }, [address, currentEra, genesisHash, soloStakingInfo]);

  // Refresh staking-related state when the chain changes,
  // which also changes the token value.
  useEffect(() => {
    if ((!soloStakingInfo && !soloStakingInfoLoaded) || !token) {
      return;
    }

    const infoToken = (soloStakingInfo || soloStakingInfoLoaded)?.stakingConsts?.token.toLowerCase();

    if (infoToken && token.toLowerCase() !== infoToken) {
      console.log('reset on change');
      fetchingFlag.current = true;
      setSoloStakingInfoLoaded(undefined);
      setSoloStakingInfo(undefined);
      setSessionInfo(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloStakingInfo?.stakingConsts?.token, soloStakingInfoLoaded?.stakingConsts?.token, token]);

  return useMemo(() => soloStakingInfo || soloStakingInfoLoaded || DEFAULT_VALUE, [soloStakingInfo, soloStakingInfoLoaded]);
}
