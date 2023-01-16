// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN } from '@polkadot/util';

import { PoolInfo } from '../../../../../../util/types';

export type Order = 'Low to High' | 'High to Low';

export interface Data {
  name: string;
  commission: number;
  nominator: number;
  staked: string;
}

function descendingComparator<T>(a: PoolInfo, b: PoolInfo, orderBy: keyof T) {
  let A, B;

  switch (orderBy) {
    case ('Members'):
      A = a.bondedPool?.memberCounter;
      B = b.bondedPool?.memberCounter;
      break;
    case ('Staked'):
      A = a.bondedPool?.points;
      B = b.bondedPool?.points;
      break;
    default:
      A = a.poolId;
      B = b.poolId;
  }

  if (A && B && new BN(A).gt(new BN(B))) {
    return -1;
  }

  if (A && B && new BN(A).lt(new BN(B))) {
    return 1;
  }

  return 0;
}

export function getComparator<T>(sortType: string): (a: PoolInfo, b: PoolInfo) => number {
  const [orderBy, order] = sortType.split(': ');

  return order === 'High to Low' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}
