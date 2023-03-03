// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import { BN, bnMax } from '@polkadot/util';

import getApi from '../getApi.ts';

async function getPoolStackingConsts(endpoint) {
  try {
    const api = await getApi(endpoint);
    const at = await api.rpc.chain.getFinalizedHead();
    const apiAt = await api.at(at);

    const ED = new BN(api.consts.balances.existentialDeposit);

    const [maxPoolMembers, maxPoolMembersPerPool, maxPools, minCreateBond, minJoinBond, minNominatorBond, lastPoolId, currentEra, token] =
      await Promise.all([
        apiAt.query.nominationPools.maxPoolMembers(),
        apiAt.query.nominationPools.maxPoolMembersPerPool(),
        apiAt.query.nominationPools.maxPools(),
        apiAt.query.nominationPools.minCreateBond(),
        apiAt.query.nominationPools.minJoinBond(),
        apiAt.query.staking.minNominatorBond(),
        apiAt.query.nominationPools.lastPoolId(),
        api.query.staking.currentEra(),
        api.registry.chainTokens[0]
      ]);

    return {
      eraIndex: Number(currentEra?.toString(), '0'),
      lastPoolId: lastPoolId.toString(),
      maxPoolMembers: maxPoolMembers.isSome ? maxPoolMembers.unwrap().toNumber() : -1,
      maxPoolMembersPerPool: maxPoolMembersPerPool.isSome ? maxPoolMembersPerPool.unwrap().toNumber() : -1,
      maxPools: maxPools.isSome ? maxPools.unwrap().toNumber() : -1,
      minCreateBond: minCreateBond.toString(),
      minCreationBond: bnMax(minCreateBond, ED, minNominatorBond).add(ED).toString(), // minimum that is needed in action
      minJoinBond: minJoinBond.toString(),
      minNominatorBond: minNominatorBond.toString(),
      token
    };
  } catch (error) {
    console.log('something went wrong while getPoolStackingConsts. err: ' + error);

    return null;
  }
}

onmessage = (e) => {
  const { endpoint } = e.data;

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  getPoolStackingConsts(endpoint).then((consts) => {
    console.log(`poolStackingConsts in worker using:${endpoint}: %o`, consts);
    postMessage(consts);
  });
};
