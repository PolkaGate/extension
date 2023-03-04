// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import type { ApiPromise } from '@polkadot/api';
import type { BN } from '@polkadot/util';
import type { PoolAccounts } from './types';

import Memoize from 'memoize-one';

import { bnToU8a, stringToU8a, u8aConcat } from '@polkadot/util';

const EMPTY_H256 = new Uint8Array(32);
const MOD_PREFIX = stringToU8a('modl');

export function createAccount (api: ApiPromise, poolId: number | bigint | BN | null | undefined, index: number): string {
  return api.registry.createType(
    'AccountId32',
    u8aConcat(
      MOD_PREFIX,
      api.consts.nominationPools.palletId.toU8a(),
      new Uint8Array([index]),
      bnToU8a(poolId, { bitLength: 32 }),
      EMPTY_H256
    )
  ).toString();
}

function getPoolAccounts(api: ApiPromise, poolId: number | bigint | BN | null | undefined): PoolAccounts {
  return {
    rewardId: createAccount(api, poolId, 1),
    stashId: createAccount(api, poolId, 0)
  };
}

export default Memoize(getPoolAccounts);
