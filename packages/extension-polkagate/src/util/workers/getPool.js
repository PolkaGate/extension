// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/* eslint-disable header/header */

// @ts-nocheck

/**
 * @description
 * get all information regarding a pool
 *
 * rewardPool.balance: The pool balance at the time of the last payout
 * rewardPool.totalEarnings: The total earnings ever at the time of the last payout
 */
import { BN_ZERO, bnMax } from '@polkadot/util';

import getApi from '../getApi.ts';
import getPoolAccounts from '../getPoolAccounts';

async function getPool(endpoint, stakerAddress, id = undefined) {
  console.log(`getPool is called for ${stakerAddress} id:${id} endpoint:${endpoint}`);
  const api = await getApi(endpoint);

  if (!api) {
    console.error('Failed to get api!');

    return;
  }

  const token = api.registry.chainTokens[0];
  const decimal = api.registry.chainDecimals[0];
  const members = !id && await api.query['nominationPools']['poolMembers'](stakerAddress);
  const member = members?.isSome ? members.unwrap() : undefined;

  if (!member && !id) {
    console.log(`can not find member for ${stakerAddress} or id is :${id}`);

    return null; // user does not joined a pool yet. or pool id does not exist
  }

  const poolId = member?.poolId?.toNumber() ?? id;
  const accounts = getPoolAccounts(api, poolId);

  if (!accounts) {
    console.log(`can not find a pool with id:${poolId}`);

    return null;
  }

  const [metadata, bondedPools, myClaimable, rewardPools, rewardIdBalance, stashIdAccount] = await Promise.all([
    api.query.nominationPools.metadata(poolId),
    api.query['nominationPools']['bondedPools'](poolId),
    api.call['nominationPoolsApi']['pendingRewards'](stakerAddress),
    api.query.nominationPools.rewardPools(poolId),
    api.query.system.account(accounts.rewardId),
    api.derive.staking.account(accounts.stashId)
  ]);

  const unwrappedRewardPools = rewardPools.isSome ? rewardPools.unwrap() : null;
  const unwrappedBondedPool = bondedPools.isSome ? bondedPools.unwrap() : null;
  const poolRewardClaimable = bnMax(BN_ZERO, rewardIdBalance.data.free.sub(api.consts['balances']['existentialDeposit']));
  const rewardPool = {};

  if (unwrappedRewardPools) {
    rewardPool.balance = unwrappedRewardPools?.balance ? String(unwrappedRewardPools.balance) : undefined;
    rewardPool.points = unwrappedRewardPools?.points ? String(unwrappedRewardPools.points) : undefined;
    rewardPool.totalEarnings = unwrappedRewardPools?.totalEarnings ? String(unwrappedRewardPools.totalEarnings) : undefined;
  }

  const poolInfo = {
    accounts,
    bondedPool: unwrappedBondedPool,
    decimal,
    member,
    metadata: metadata.length
      ? metadata.isUtf8
        ? metadata.toUtf8()
        : metadata.toString()
      : null,
    myClaimable: Number(myClaimable ?? '0'),
    poolId,
    rewardClaimable: Number(poolRewardClaimable),
    rewardIdBalance: rewardIdBalance.data,
    rewardPool: unwrappedRewardPools,
    stashIdAccount,
    token
  };

  return JSON.stringify(poolInfo);
}

onmessage = (e) => {
  const { endpoint, id, stakerAddress } = e.data;

  // eslint-disable-next-line no-void
  void getPool(endpoint, stakerAddress, id).then((poolInfo) => {
    postMessage(poolInfo);
  });
};
