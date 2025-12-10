// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { AccountStakingInfo, StakingConsts } from '../util/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { getStorage, isHexToBn, setStorage, toBN } from '../util';
import { getReleaseDate } from './utils/getReleaseDate';
import useBalances from './useBalances';
import useChainInfo from './useChainInfo';
import useCurrentEraIndex from './useCurrentEraIndex';
import useSoloStakingTotalReward from './useSoloStakingTotalReward';
import useStakingAccount from './useStakingAccount';
import useStakingConsts from './useStakingConsts';
import useStakingRewardDestinationAddress from './useStakingRewardDestinationAddress';
import { useEraInfo, useIsValidator } from '.';

export interface EraInfo {
  blockTime: number; // usually 6 sec
  eraLength: number; // Length of an era in blocks
  eraProgress: number; // Current progress within the era
  activeEra: number; // Active era number
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
  isValidator: boolean | undefined;
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
const getUnstakingAmount = (stakingAccount: AccountStakingInfo | null | undefined, eraInfo: EraInfo | undefined): UnstakingType | undefined => {
  if (!eraInfo || !stakingAccount) {
    return undefined;
  }

  const { activeEra, blockTime, eraLength, eraProgress } = eraInfo;

  const toBeReleased = [];
  let unlockingAmount;

  if (activeEra) {
    unlockingAmount = BN_ZERO;

    if (stakingAccount.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = toBN(value);

          unlockingAmount = unlockingAmount.add(amount);
          const date = getReleaseDate(remainingEras.clone(), eraLength, eraProgress, blockTime);

          toBeReleased.push({ amount, date });
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

const DEFAULT_VALUE = {
  availableBalanceToStake: undefined,
  isValidator: undefined,
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
  const { chainName } = useChainInfo(genesisHash);
  const balances = useBalances(address, genesisHash);
  const currentEra = useCurrentEraIndex(genesisHash);
  const stakingAccount = useStakingAccount(address, genesisHash, refresh, setRefresh);
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);
  const isValidator = useIsValidator(address, genesisHash);
  const rewards = useSoloStakingTotalReward(chainName, stakingAccount); // total reward
  const stakingConsts = useStakingConsts(genesisHash);
  const eraInfo = useEraInfo(genesisHash);

  const [soloStakingInfoStorage, setSoloStakingInfoStorage] = useState<SoloStakingInfo | undefined>(undefined);
  const [soloStakingInfo, setSoloStakingInfo] = useState<SoloStakingInfo | undefined>(undefined);
  const [sessionInfo, setSessionInfo] = useState<UnstakingType | undefined>(undefined);

  // Tracks when we need to save to storage
  const needsStorageUpdate = useRef(false);
  // Tracks when it is done with fetching solo staking information
  const fetchingFlag = useRef(true);
  // Tracks when it is done with fetching rewards
  const rewardsFetchingFlag = useRef(true);
  // Tracks which position is selected
  const selectedPositionFlag = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (refresh) {
      fetchingFlag.current = true;
      setSoloStakingInfo(undefined);
      setSessionInfo(undefined);
    }
  }, [refresh]);

  useEffect(() => {
    if (fetchingFlag.current && !sessionInfo && eraInfo) {
      const info = getUnstakingAmount(stakingAccount, eraInfo);

      setSessionInfo(info);
    }
  }, [eraInfo, sessionInfo, stakingAccount]);

  // Separate effect for updating the state
  useEffect(() => {
    if (fetchingFlag.current === false || currentEra === undefined || !balances || !stakingAccount || !sessionInfo || !rewardDestinationAddress || !genesisHash || !address || refresh) {
      return;
    }

    const info = {
      availableBalanceToStake: balances.freeBalance,
      isValidator,
      rewardDestinationAddress,
      rewards,
      sessionInfo,
      stakingAccount,
      stakingConsts
    };

    fetchingFlag.current = false;

    selectedPositionFlag.current = genesisHash;

    const nonUndefinedInfo = Object.fromEntries(
      Object.entries(info).filter(([_, v]) => v !== undefined)
    );

    setSoloStakingInfo((pre) => ({ ...pre, ...nonUndefinedInfo }) as SoloStakingInfo);
  }, [address, balances, currentEra, genesisHash, rewardDestinationAddress, rewards, sessionInfo, stakingAccount, stakingConsts, refresh, isValidator]);

  useEffect(() => {
    if (rewards && soloStakingInfo && rewardsFetchingFlag.current) {
      rewardsFetchingFlag.current = false;
      setSoloStakingInfo((pre) => ({ ...pre, rewards }) as SoloStakingInfo);
    }
  }, [rewards, soloStakingInfo]);

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

      selectedPositionFlag.current = genesisHash;

      getStorage(key, true).then((parsed) => {
        const parsedInfo = parsed as SavedSoloStakingInfo;

        if (parsedInfo?.currentEra === currentEra) {
          const revived = reviveSoloStakingInfoBNs(parsedInfo);

          setSoloStakingInfoStorage(revived);
          needsStorageUpdate.current = false;
        }
      }).catch(console.error);
    }
  }, [address, currentEra, genesisHash, soloStakingInfo]);

  // Refresh staking-related state when the chain changes,
  // which also changes the token value.
  useEffect(() => {
    if (selectedPositionFlag.current && genesisHash && selectedPositionFlag.current !== genesisHash) {
      console.log('[useSoloStakingInfo] Resetting staking state due to chain mismatch');
      fetchingFlag.current = true;
      setSoloStakingInfoStorage(undefined);
      setSoloStakingInfo(undefined);
      setSessionInfo(undefined);

      selectedPositionFlag.current = genesisHash;
    }
  }, [genesisHash]);

  return useMemo(() => soloStakingInfo || soloStakingInfoStorage || DEFAULT_VALUE, [soloStakingInfo, soloStakingInfoStorage]);
}
