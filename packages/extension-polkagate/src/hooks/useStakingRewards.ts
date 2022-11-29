// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** 
 * @description
 * this hook returns a 
 * */

import { useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { postData } from '../util/api';
import { useChain } from '.';

export async function getStakingReward(_chain: Chain | null | undefined, _stakerAddress: AccountId | string | null): Promise<string | null> {
  if (!_stakerAddress) {
    console.log('_stakerAddress is null in getting getStakingReward ');

    return null;
  }

  return new Promise((resolve) => {
    try {
      const network = _chain ? _chain.name.replace(' Relay Chain', '') : 'westend';

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + network + '.api.subscan.io/api/scan/staking_history',
        {
          address: _stakerAddress,
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
      console.log('something went wrong while getting getStakingReward ');
      resolve(null);
    }
  });
}

export default function useStakingRewards(stashId: AccountId | undefined): BN | undefined {
  const [rewards, setRewards] = useState<BN>();
  const chain = useChain(stashId);

  useEffect(() => {
    if (!stashId) {
      return;
    }

    getStakingReward(chain, stashId).then((r) => {
      setRewards(r ? new BN(r) : BN_ZERO);
    }).catch(console.error);
  }, [chain, stashId]);

  return rewards;
}
