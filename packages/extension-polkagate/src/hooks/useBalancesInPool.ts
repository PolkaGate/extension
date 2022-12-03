// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { usePoolBalances } from '.';

interface Output {
  balance: BN;
  token: string;
}

export default function useBalancesInPool(address: string): Output | null | undefined {
  const [pooledBalance, setBalance] = useState<Output | undefined | null>();
  const pool = usePoolBalances(address);

  useEffect(() => {
    if (!pool) {
      return setBalance(pool);
    }

    const active = new BN(pool.member.points).isZero() ? BN_ZERO : (new BN(pool.member.points).mul(new BN(pool.stashIdAccount.stakingLedger.active))).div(new BN(pool.bondedPool.points));
    const rewards = new BN(pool.myClaimable);
    let unlockingValue = BN_ZERO;

    if (pool.member?.unbondingEras) {
      for (const [_, unbondingPoint] of Object.entries(pool.member?.unbondingEras)) {
        unlockingValue = unlockingValue.add(new BN(unbondingPoint as string));
      }
    }

    setBalance({
      balance: active.add(rewards).add(unlockingValue),
      token: pool.token
    });
  }, [pool]);

  return pooledBalance;
}
