// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

export function balancify (balances) {
  const base = {
    availableBalance: String(balances.availableBalance),
    freeBalance: String(balances.freeBalance),
    lockedBalance: String(balances.lockedBalance),
    reservedBalance: String(balances.reservedBalance),
    vestedBalance: String(balances.vestedBalance),
    vestedClaimable: String(balances.vestedClaimable),
    vestingLocked: String(balances.vestingLocked),
    vestingTotal: String(balances.vestingTotal),
    votingBalance: String(balances.votingBalance)
  };

  if (balances.soloTotal) {
    base.soloTotal = String(balances.soloTotal);
  }

  if (balances.pooledBalance) {
    base.pooledBalance = String(balances.pooledBalance);
  }

  return JSON.stringify(base);
}

export function balancifyAsset (balances) {
  return JSON.stringify({
    availableBalance: String(balances.free),
    frozenBalance: String(balances.frozen),
    reservedBalance: String(balances.reserved)
  });
}
