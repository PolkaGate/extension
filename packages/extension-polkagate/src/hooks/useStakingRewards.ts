// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a 
 * */

import { useEffect, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { postData } from '../util/api';
import { AccountStakingInfo } from '../util/types';
import { useChainName, useStakingRewardDestinationAddress } from '.';

export async function getStakingReward(chainName: string, address: AccountId | string | null): Promise<string | null> {
  if (!address) {
    console.log('address is null in getting get Staking Rewards ');

    return null;
  }

  console.log(`Getting Staking Reward from subscan  on chain:${chainName} for address:${address} ... `);

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/staking_history',
        {
          address,
          page: 0,
          row: 20
        })
        .then((data: { message: string; data: { sum: string; }; }) => {
          if (data.message === 'Success') {
            const reward = data.data.sum;

            resolve(reward);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting get Staking Rewards ');
      resolve(null);
    }
  });
}

export default function useStakingRewards(address: string, stakingAccount: AccountStakingInfo | null | undefined): BN | undefined {
  const [rewards, setRewards] = useState<BN>();
  const chainName = useChainName(address);
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
