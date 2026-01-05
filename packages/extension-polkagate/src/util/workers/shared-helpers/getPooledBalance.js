// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import getPoolAccounts from '../../getPoolAccounts';

export async function getPooledBalance (api, address) {
  const response = await api.query.nominationPools.poolMembers(address);
  const member = response?.unwrapOr(undefined);

  if (!member) {
    return { pooledBalance: BN_ZERO };
  }

  const poolId = member.poolId;
  const accounts = poolId && getPoolAccounts(api, poolId);

  if (!accounts) {
    return { pooledBalance: BN_ZERO };
  }

  const [bondedPool, metadata, stashIdAccount, myClaimable = BN_ZERO, claimPermissions] = await Promise.all([
    api.query.nominationPools.bondedPools(poolId),
    api.query.nominationPools.metadata(poolId),
    api.derive.staking.account(accounts.stashId),
    api.call.nominationPoolsApi?.pendingRewards(address), // not available on paseo hub
    api.query.nominationPools.claimPermissions(address)
  ]);

  const active = member.points.isZero()
    ? BN_ZERO
    : (new BN(String(member.points)).mul(new BN(String(stashIdAccount.stakingLedger.active)))).div(new BN(String(bondedPool.unwrap()?.points ?? BN_ONE)));

  let unlockingValue = BN_ZERO;

  member?.unbondingEras?.forEach((value) => {
    unlockingValue = unlockingValue.add(value);
  });

  const poolName = metadata.length
    ? metadata.isUtf8
      ? metadata.toUtf8()
      : metadata.toString()
    : null;

  return {
    claimPermissions: claimPermissions.toString(),
    poolName,
    poolReward: myClaimable.toString(),
    pooledBalance: active.add(unlockingValue).toString()
  };
}
