// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ValidatorInfo } from '../../../util/types';

export type Order = 'asc' | 'desc';

export interface Data {
  name: string;
  commission: number;
  nominator: number;
  staked: string;
}

function descendingComparator<T>(a: ValidatorInfo, b: ValidatorInfo, orderBy: keyof T) {
  let A, B;

  switch (orderBy) {
    case ('commission'):
      A = a.validatorPrefs.commission;
      B = b.validatorPrefs.commission;
      break;
    case ('nominator'):
      A = a.exposure.others.length;
      B = b.exposure.others.length;
      break;
    default:
      A = a.accountId;
      B = b.accountId;
  }

  if (B < A) {
    return -1;
  }

  if (B > A) {
    return 1;
  }

  return 0;
}

export function getComparator<T>(order: Order, orderBy: keyof T): (a: ValidatorInfo, b: ValidatorInfo) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}
