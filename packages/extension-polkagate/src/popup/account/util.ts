// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { BN, BN_ZERO } from '@polkadot/util';

export const getValue = (type: string, balances: DeriveBalancesAll | null | undefined): BN | undefined => {
  if (!balances) {
    return;
  }

  switch (type.toLocaleLowerCase()) {
    case ('total'):
    case ('total balance'):
      return balances.freeBalance.add(balances.reservedBalance).add(balances?.poolBalance ?? BN_ZERO);
    case ('available'):
    case ('available balance'):
      return balances.availableBalance;
    case ('reserved'):
      return balances.reservedBalance;
    case ('others'):
      return balances.lockedBalance.add(balances.vestingTotal);
    case ('free balance'):
      return balances.freeBalance;
    case ('reserved balance'):
      return balances.reservedBalance;
    case ('frozen misc'):
      return balances.frozenMisc;
    case ('frozen fee'):
      return balances.frozenFee;
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

