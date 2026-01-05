// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { AccountStakingInfo } from '../util/types';

import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { fetchFromSubscan, getSubscanChainName } from '../util';
import useStakingRewardDestinationAddress from './useStakingRewardDestinationAddress';

export async function getStakingReward(chainName: string, address: AccountId | string | null): Promise<string | null> {
  if (!address) {
    console.log('address is null in getting get Staking Total Rewards ');

    return null;
  }

  const network = getSubscanChainName(chainName) as unknown as string;

  try {
    const data = await fetchFromSubscan<{ message: string; data: { sum: string; }; }>(
      `https://${network}.api.subscan.io/api/scan/staking/total_reward`, { address });

    if (data.message === 'Success') {
      const reward = data.data.sum;

      return reward;
    } else {
      console.log(`Fetching message ${data.message}`);

      return null;
    }
  } catch (error) {
    console.error('something went wrong while getting get Staking Total Rewards ', error);

    return null;
  }
}

export default function useSoloStakingTotalReward(chainName: string | undefined, stakingAccount: AccountStakingInfo | null | undefined): BN | undefined {
  const [rewards, setRewards] = useState<BN>();
  const rewardDestinationAddress = useStakingRewardDestinationAddress(stakingAccount);

  useEffect(() => {
    if (!chainName || !rewardDestinationAddress) {
      setRewards(undefined);

      return;
    }

    getStakingReward(chainName, rewardDestinationAddress).then((r) => {
      setRewards(r ? new BN(r) : BN_ZERO);
    }).catch(console.error);
  }, [chainName, rewardDestinationAddress]);

  return rewards;
}
