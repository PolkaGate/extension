// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import getApi from '../getApi';
import getPoolAccounts from '../getPoolAccounts';

async function getMyPools(address, endpoint) {
  const api = await getApi(endpoint);

  const lastPoolId = await api.query.nominationPools.lastPoolId();

  console.log(`Getting ${lastPoolId.toNumber()} pools information.`);

  if (!lastPoolId) {
    return null;
  }

  const queries = [];

  for (let poolId = 1; poolId <= lastPoolId.toNumber(); poolId++) {
    queries.push(Promise.all([
      api.query.nominationPools.metadata(poolId),
      api.query.nominationPools.bondedPools(poolId),
      api.query.nominationPools.rewardPools(poolId)
    ]));
  }

  const info = await Promise.all(queries);

  const poolsInfo = info.map((i, index) => {
    if (i[1].isSome) {
      const bondedPool = i[1].unwrap();

      return {
        bondedPool: {
          memberCounter: String(bondedPool.memberCounter),
          points: String(bondedPool.points),
          roles: bondedPool.roles,
          state: bondedPool.state
        },
        metadata: i[0]?.length
          ? i[0]?.isUtf8
            ? i[0]?.toUtf8()
            : i[0]?.toString()
          : null,
        poolId: index + 1, // works because pools id is not reuseable for now
        rewardPool: i[2]?.isSome ? i[2].unwrap() : null
      };
    } else {
      return undefined;
    }
  })?.filter((f) => f !== undefined);

  const filteredPools = poolsInfo.filter((poolInfo) => String(poolInfo?.bondedPool?.roles.root) === address || String(poolInfo?.bondedPool?.roles.stateToggler) === address || String(poolInfo?.bondedPool?.roles.nominator) === address);

  const token = api.registry.chainTokens[0];
  const decimal = api.registry.chainDecimals[0];

  const myPools = filteredPools.map(async (poolInfo) => {
    const accounts = getPoolAccounts(api, poolInfo.poolId);

    if (!accounts) {
      console.log(`can not find a pool with id:${poolInfo.poolId}`);

      return null;
    }

    const [rewardPools, rewardIdBalance, stashIdAccount] = await Promise.all([
      api.query.nominationPools.rewardPools(poolInfo.poolId),
      api.query.system.account(accounts.rewardId),
      api.derive.staking.account(accounts.stashId)
    ]);

    const unwrappedRewardPools = rewardPools.isSome ? rewardPools.unwrap() : null;
    const poolRewardClaimable = bnMax(BN_ZERO, rewardIdBalance.data.free.sub(api.consts.balances
      .existentialDeposit));
    const rewardPool = {};

    if (unwrappedRewardPools) {
      rewardPool.balance = unwrappedRewardPools?.balance ? String(unwrappedRewardPools.balance) : undefined;
      rewardPool.points = unwrappedRewardPools?.points ? String(unwrappedRewardPools.points) : undefined;
      rewardPool.totalEarnings = unwrappedRewardPools?.totalEarnings ? String(unwrappedRewardPools.totalEarnings) : undefined;
    }

    const pool = {
      accounts,
      bondedPool: poolInfo.bondedPool,
      decimal,
      member: undefined,
      metadata: poolInfo.metadata?.length
        ? poolInfo.metadata.isUtf8
          ? poolInfo.metadata.toUtf8()
          : poolInfo.metadata.toString()
        : null,
      myClaimable: Number('0'),
      poolId: poolInfo.poolId,
      rewardClaimable: Number(poolRewardClaimable),
      rewardIdBalance: rewardIdBalance.data,
      rewardPool: unwrappedRewardPools,
      stashIdAccount,
      token
    };

    return pool;
  });

  const amirPools = await Promise.all(myPools);

  return JSON.stringify(amirPools);
}

onmessage = (e) => {
  const { address, endpoint } = e.data;

  // eslint-disable-next-line no-void
  void getMyPools(address, endpoint).then((poolsInfo) => {
    postMessage(poolsInfo);
  });
};
