// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-case-declarations */

/**
 * @description
 * this component shows an account information in detail
 * */

import type { BalancesInfo, FetchedBalance } from '../../util/types';

import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { toBN } from '../../util';

function isEmptyObject (obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Retrieves a specific balance value from the provided `balances` object based on the given `type`.
 *
 * @param {string} type - The type of balance to retrieve (e.g., 'total', 'available', 'reserved').
 * @param {BalancesInfo | null | undefined} balances - The balance information object.
 * @returns {BN | undefined} The requested balance as a `BN` instance, or `undefined` if `balances` is null/empty.
 */
export const getValue = (type: string, balances: BalancesInfo | FetchedBalance | null | undefined): BN | undefined => {
  if (!balances || isEmptyObject(balances)) {
    return;
  }

  switch (type.toLocaleLowerCase()) {
    case ('total'):
    case ('total balance'):

      return balances?.freeBalance && balances.reservedBalance
        ? new BN(balances.freeBalance).add(new BN(balances.reservedBalance))
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
    case ('transferable'):
      const { freeBalance = BN_ZERO, frozenBalance = BN_ZERO, reservedBalance = BN_ZERO } = balances ?? {};

      const frozen = toBN(frozenBalance);
      const reserved = toBN(reservedBalance);
      const free = toBN(freeBalance);

      const frozenReserveDiff = frozen.sub(reserved);
      const untouchable = bnMax(BN_ZERO, frozenReserveDiff);

      return free.sub(untouchable);
    case ('reserved'):
      return balances.reservedBalance;
    case ('others'):
      return (balances.lockedBalance ?? BN_ZERO).add(balances.vestingTotal ?? BN_ZERO);
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
