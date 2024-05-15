// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this hook returns the amount which is available to be staked as Solo
 * */

import { useMemo } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { useBalances, useStakingAccount, useUnstakingAmount } from '.';

export default function useAvailableToSoloStake (address: AccountId | string | undefined, refresh?:boolean): BN | undefined {
  const stakingAccount = useStakingAccount(address, undefined, refresh);
  const balances = useBalances(address, refresh);
  const { unlockingAmount } = useUnstakingAmount(address);

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active as unknown as BN, [stakingAccount?.stakingLedger?.active]);
  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);

  return useMemo(() =>
    balances?.freeBalance && staked && unlockingAmount &&
    balances.freeBalance.sub(staked).sub(unlockingAmount).sub(redeemable || BN_ZERO)
  , [balances?.freeBalance, redeemable, staked, unlockingAmount]);
}
