// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { getPooledBalance } from './getPooledBalance.js';

/**
 * @param {string} address
 * @param {import("@polkadot/api").ApiPromise} api
 */
export async function getStakingBalances(address, api) {
  let soloTotal = BN_ZERO;
  let pooled;

  if (api.query['nominationPools']) {
    pooled = await getPooledBalance(api, address);
  }

  if (api.query['staking']?.['ledger']) {
    const ledger = await api.query['staking']['ledger'](address);

    // @ts-ignore
    if (ledger.isSome) {
      // @ts-ignore
      soloTotal = ledger?.unwrap()?.total?.toString();
    }
  }

  return { pooled, soloTotal };
}
