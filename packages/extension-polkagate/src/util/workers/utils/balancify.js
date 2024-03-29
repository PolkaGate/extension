// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function balancify (balances) {
  return JSON.stringify({
    availableBalance: String(balances.availableBalance),
    freeBalance: String(balances.freeBalance),
    lockedBalance: String(balances.lockedBalance),
    reservedBalance: String(balances.reservedBalance),
    vestedBalance: String(balances.vestedBalance),
    vestedClaimable: String(balances.vestedClaimable),
    vestingLocked: String(balances.vestingLocked),
    vestingTotal: String(balances.vestingTotal),
    votingBalance: String(balances.votingBalance)
  });
}

export function balancifyAsset (balances) {
  return JSON.stringify({
    availableBalance: String(balances.free),
    frozenBalance: String(balances.frozen),
    reservedBalance: String(balances.reserved)
  });
}
