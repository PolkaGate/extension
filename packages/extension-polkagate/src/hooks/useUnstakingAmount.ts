// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { useApi, useStakingAccount } from '.';

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

interface DateAmount {
  date: number;
  amount: BN
}

interface UnstakingType {
  toBeReleased: DateAmount[] | undefined;
  unlockingAmount: BN | undefined;
}

/**
 * @description get the total unstaking amount and their release dates
 *
 */
export default function useUnstakingAmount (address: AccountId | string | undefined, refresh?: boolean): UnstakingType {
  const api = useApi(address);
  const stakingAccount = useStakingAccount(address, undefined, refresh);

  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    });
  }, [api]);

  return useMemo(() => {
    const toBeReleased = [];
    let unlockingAmount;

    if (stakingAccount && sessionInfo) {
      unlockingAmount = BN_ZERO;

      if (stakingAccount?.unlocking) {
        for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
          if (remainingEras.gtn(0)) {
            const amount = new BN(value as unknown as string);

            unlockingAmount = unlockingAmount.add(amount);
            const secToBeReleased = (Number(remainingEras.subn(1)) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6;

            toBeReleased.push({ amount, date: Date.now() + (secToBeReleased * 1000) });
          }
        }
      }
    }

    return { toBeReleased, unlockingAmount };
  }, [sessionInfo, stakingAccount]);
}
