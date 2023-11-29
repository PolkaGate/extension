// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this hook returns a solo staking reward destination address
 * */

import { useEffect, useState } from 'react';

import { AccountStakingInfo } from '../util/types';

export default function useStakingRewardDestinationAddress(stakingAccount: AccountStakingInfo | null | undefined): string | undefined {
  const [payeeAddress, setPayeeAddress] = useState<string>();

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    const destinationType = Object.keys(stakingAccount.rewardDestination)[0];
    let payeeAddress: string;

    if (destinationType === 'account') {
      payeeAddress = stakingAccount.rewardDestination.account as string;
    } else if (['staked', 'stash'].includes(destinationType)) {
      payeeAddress = stakingAccount.stashId as unknown as string;
    } else {
      payeeAddress = stakingAccount.controllerId;
    }

    payeeAddress && setPayeeAddress(payeeAddress);
  }, [stakingAccount]);

  return payeeAddress;
}
