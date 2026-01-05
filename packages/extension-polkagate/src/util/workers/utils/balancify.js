// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
import { BN_ZERO } from '@polkadot/util';

export function balancify(balances) {
  const base = {
    ED: String(balances.ED),
    availableBalance: String(balances.availableBalance),
    freeBalance: String(balances.freeBalance),
    frozenBalance: String(balances.frozenBalance),
    lockedBalance: String(balances.lockedBalance),
    reservedBalance: String(balances.reservedBalance),
    vestedBalance: String(balances.vestedBalance),
    vestedClaimable: String(balances.vestedClaimable),
    vestingLocked: String(balances.vestingLocked),
    vestingTotal: String(balances.vestingTotal),
    votingBalance: String(balances.freeBalance.add(balances?.reservedBalance || BN_ZERO)) // after pool migration the voting balance returned fro api is not correct
  };

  if (balances.soloTotal) {
    base.soloTotal = String(balances.soloTotal);
  }

  if (balances.pooledBalance) {
    base.pooledBalance = String(balances.pooledBalance);
    base.poolReward = String(balances.poolReward);
  }

  return JSON.stringify(base);
}

export function balancifyAsset(balances) {
  return JSON.stringify({
    ED: String(balances.ED),
    availableBalance: String(balances.free),
    freeBalance: String(balances.free),
    frozenBalance: String(balances.frozen),
    reservedBalance: String(balances.reserved)
  });
}
