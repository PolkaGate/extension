// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

/**
 * @description
 * get all information regarding a pool
 *
 * rewardPool.balance: The pool balance at the time of the last payout
 * rewardPool.totalEarnings: The total earnings ever at the time of the last payout
 */
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import getApi from '../getApi.ts';
import getPoolAccounts from '../getPoolAccounts';

async function getPoolBalances(endpoint, stakerAddress, id = undefined) {
  console.log(`getPoolBalances is called for ${stakerAddress} id:${id}`);
  const api = await getApi(endpoint);
  const token = api.registry.chainTokens[0];
  const members = !id && await api.query.nominationPools.poolMembers(stakerAddress);
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

  const [bondedPools, stashIdAccount, myClaimable] = await Promise.all([
    api.query.nominationPools.bondedPools(poolId),
    api.derive.staking.account(accounts.stashId),
    api.call.nominationPoolsApi.pendingRewards(stakerAddress)
  ]);

  const poolInfo = {
    bondedPool: bondedPools.isSome ? bondedPools.unwrap() : null,
    member,
    myClaimable: Number(myClaimable ?? '0'),
    stashIdAccount,
    token
  };

  return JSON.stringify(poolInfo);
}

onmessage = (e) => {
  const { endpoint, id, stakerAddress } = e.data;

  // eslint-disable-next-line no-void
  void getPoolBalances(endpoint, stakerAddress, id).then((poolInfo) => {
    postMessage(poolInfo);
  });
};
