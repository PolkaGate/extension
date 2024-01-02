// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ValidatorInfo } from '../../../util/types';

export type Order = 'Low to High' | 'High to Low';

export interface Data {
  name: string;
  commission: number;
  nominator: number;
  staked: string;
}

function descendingComparator<T>(a: ValidatorInfo, b: ValidatorInfo, orderBy: keyof T) {
  let A, B;

  switch (orderBy) {
    case ('Commissions'):
      A = a.validatorPrefs.commission;
      B = b.validatorPrefs.commission;
      break;
    case ('Nominators'):
      A = a.exposure.others.length;
      B = b.exposure.others.length;
      break;
    case ('Staked'):
      A = a.exposure.total;
      B = b.exposure.total;
      break;
    default:
      A = a.accountId;
      B = b.accountId;
  }

  if (A > B) {
    return -1;
  }

  if (A < B) {
    return 1;
  }

  return 0;
}

export function getComparator<T>(sortType: string): (a: ValidatorInfo, b: ValidatorInfo) => number {
  const [orderBy, order] = sortType.split(': ');

  return order === 'High to Low' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}
