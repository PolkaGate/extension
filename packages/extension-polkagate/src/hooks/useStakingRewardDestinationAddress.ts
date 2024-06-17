// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/**
 * @description
 * this hook returns a solo staking reward destination address
 * */

import { useEffect, useState } from 'react';

import type { AccountStakingInfo } from '../util/types';

export default function useStakingRewardDestinationAddress(stakingAccount: AccountStakingInfo | null | undefined): string | undefined {
  const [payeeAddress, setPayeeAddress] = useState<string>();

  useEffect(() => {
    if (!stakingAccount || !stakingAccount.rewardDestination) {
      return;
    }

    const destinationType = Object.keys(stakingAccount.rewardDestination)[0];
    let payeeAddress: string | null;

    if (destinationType === 'account') {
      payeeAddress = stakingAccount.rewardDestination.account as string;
    } else if (['staked', 'stash'].includes(destinationType)) {
      payeeAddress = stakingAccount.stashId as unknown as string;
    } else {
      payeeAddress = stakingAccount.controllerId as unknown as string;
    }

    payeeAddress && setPayeeAddress(payeeAddress);
  }, [stakingAccount]);

  return payeeAddress;
}
