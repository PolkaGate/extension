// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { BN } from '@polkadot/util';

export const getValue = (type: string, balances: DeriveBalancesAll | undefined): BN | undefined => {
  if (!balances) {
    return;
  }

  switch (type) {
    case ('Total'):
      return balances.freeBalance.add(balances.reservedBalance);
    case ('Available'):
      return balances.availableBalance;
    case ('Reserved'):
      return balances.reservedBalance;
    case ('Others'):
      return balances.lockedBalance.add(balances.vestingTotal);
    case ('Free Balance'):
      return balances.freeBalance;
    case ('Reserved Balance'):
      return balances.reservedBalance;
    case ('Frozen Misc'):
      return balances.frozenMisc;
    case ('Frozen Fee'):
      return balances.frozenFee;
    case ('Locked Balance'):
      return balances.lockedBalance;
    case ('Vested Balance'):
      return balances.vestedBalance;
    case ('Vested Claimable'):
      return balances.vestedClaimable;
    case ('Vesting Locked'):
      return balances.vestingLocked;
    case ('Vesting Total'):
      return balances.vestingTotal;
    case ('Voting Balance'):
      return balances.votingBalance;
    default:
      return undefined;
  }
};

