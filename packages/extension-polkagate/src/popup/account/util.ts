// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @description
 * this component shows an account information in detail
 * */

import type { BalancesInfo } from '../../util/types';

import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { MIGRATED_NOMINATION_POOLS_CHAINS } from '../../util/constants';

function isEmptyObject (obj: object): boolean {
  return Object.keys(obj).length === 0;
}

export const getValue = (type: string, balances: BalancesInfo | null | undefined): BN | undefined => {
  if (!balances || isEmptyObject(balances)) {
    return;
  }

  switch (type.toLocaleLowerCase()) {
    case ('total'):
    case ('total balance'):
      // eslint-disable-next-line no-case-declarations
      const isPoolsMigrated = MIGRATED_NOMINATION_POOLS_CHAINS.includes(balances.genesisHash);

      return balances?.freeBalance && balances.reservedBalance
        ? new BN(balances.freeBalance).add(new BN(balances.reservedBalance)).add((balances?.pooledBalance && !isPoolsMigrated) ? new BN(balances.pooledBalance) : BN_ZERO)
        : new BN(balances?.totalBalance || 0);
    case ('pooled balance'):
    case ('pool stake'):
      return balances?.pooledBalance ?? BN_ZERO;
    case ('solo'):
    case ('solo stake'):
      return balances?.soloTotal ?? BN_ZERO;
    case ('balance'):
    case ('available'):
    case ('available balance'):
      return balances.availableBalance;

    case ('transferable'):
    {
      const frozenBalance = balances.frozenBalance || BN_ZERO; // for backward compatibility of PolkaGate extension
      const noFrozenReserved = frozenBalance.isZero() && balances.reservedBalance.isZero();

      const frozenReserveDiff = frozenBalance.sub(balances.reservedBalance);
      const maybeED = noFrozenReserved ? BN_ZERO : (balances.ED || BN_ZERO);
      const untouchable = bnMax(maybeED, frozenReserveDiff);

      return balances.freeBalance.sub(untouchable);
    }

    case ('reserved'):
      return balances.reservedBalance;
    case ('others'):
      return balances.lockedBalance.add(balances.vestingTotal);
    case ('free'):
    case ('free balance'):
      return balances.freeBalance;
    case ('reserved balance'):
      return balances.reservedBalance;
    case ('locked'):
    case ('locked balance'):
      return balances.lockedBalance;
    case ('vested balance'):
      return balances.vestedBalance;
    case ('vested claimable'):
      return balances.vestedClaimable;
    case ('vesting locked'):
      return balances.vestingLocked;
    case ('vesting total'):
      return balances.vestingTotal;
    case ('voting balance'):
      return balances.votingBalance;
    default:
      return undefined;
  }
};
