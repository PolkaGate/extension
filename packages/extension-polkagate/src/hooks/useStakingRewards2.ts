// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { AccountStakingInfo } from '../util/types';

import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { postData } from '../util/api';
import { useStakingRewardDestinationAddress } from '.';

export async function getStakingReward (chainName: string, address: AccountId | string | null): Promise<string | null> {
  if (!address) {
    console.log('address is null in getting get Staking Total Rewards ');

    return null;
  }

  console.log(`Getting Staking Total Reward from subscan  on ${chainName} for ${String(address)} ... `);

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/staking/total_reward', { address })
        .then((data: { message: string; data: { sum: string; }; }) => {
          if (data.message === 'Success') {
            const reward = data.data.sum;

            resolve(reward);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        })
        .catch((error) => {
          console.log('something went wrong while getting get Staking Total Rewards ', error);
          resolve(null);
        });
    } catch (error) {
      console.log('something went wrong while getting get Staking Total Rewards ', error);
      resolve(null);
    }
  });
}

export default function useStakingRewards2 (chainName: string | undefined, stakingAccount: AccountStakingInfo | null | undefined): BN | undefined {
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
