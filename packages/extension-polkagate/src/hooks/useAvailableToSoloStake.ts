// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this hook returns the amount which is available to be staked as Solo
 * */

import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { BN } from '@polkadot/util';

import { useMemo } from 'react';

import { BN_ZERO, bnMax } from '@polkadot/util';

import { useBalances, useStakingAccount, useUnstakingAmount } from '.';

export default function useAvailableToSoloStake (address: AccountId | string | undefined, refresh?: boolean): BN | undefined {
  const stakingAccount = useStakingAccount(address, undefined, refresh);
  const balances = useBalances(address as string, refresh);
  const { unlockingAmount } = useUnstakingAmount(address);

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active as unknown as BN, [stakingAccount?.stakingLedger?.active]);
  const redeemable = useMemo(() => stakingAccount?.redeemable, [stakingAccount?.redeemable]);

  return useMemo(() => {
    if (!balances?.freeBalance || !staked || !unlockingAmount) {
      return undefined;
    }

    const _availableToStake = balances.freeBalance.sub(staked).sub(unlockingAmount).sub(redeemable || BN_ZERO);

    // the reserved balance can be considered here as the amount which can be staked as well in solo,
    // but since pooled balance are migrating to the reserved balance. and also the pallet has issue to accept reserved,
    // hence it needs more workaround on it
    return bnMax(BN_ZERO, _availableToStake);
  }, [balances?.freeBalance, redeemable, staked, unlockingAmount]);
}
