// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import getApi from '../getApi.ts';
import getPoolAccounts from '../getPoolAccounts';

async function getPools(endpoint) {
  const api = await getApi(endpoint);

  const lastPoolId = await api.query.nominationPools.lastPoolId();

  console.log(`getPools: Getting ${lastPoolId.toNumber()} pools information.`);

  if (!lastPoolId) {
    return null;
  }

  let info = [];
  const page = 50;
  let totalFetched = 0;

  while (lastPoolId > totalFetched) {
    console.log(`Fetching pools info : ${totalFetched}/${lastPoolId}`);
    const queries = [];
    const upperBond = totalFetched + page < lastPoolId ? totalFetched + page : lastPoolId;

    for (let poolId = totalFetched + 1; poolId <= upperBond; poolId++) {
      const { stashId } = getPoolAccounts(api, poolId);

      queries.push(Promise.all([
        api.query.nominationPools.metadata(poolId),
        api.query.nominationPools.bondedPools(poolId),
        api.query.nominationPools.rewardPools(poolId),
        api.derive.staking.account(stashId)
      ]));
    }

    const i = await Promise.all(queries);

    info = info.concat(i);
    totalFetched += page;
  }

  let poolsInfo = info.map((i, index) => {
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
        rewardPool: i[2]?.isSome ? i[2].unwrap() : null,
        stashIdAccount: i[3]
      };
    } else {
      return undefined;
    }
  })?.filter((f) => f !== undefined);

  console.log('getting pools owners identities...');
  const identities = await Promise.all(poolsInfo.map((pool) => api.derive.accounts.info(pool.bondedPool.roles?.root || pool.bondedPool.roles.depositor)));

  poolsInfo = poolsInfo.map((p, index) => {
    p.identity = identities[index].identity;

    return p;
  });

  console.log(`${identities?.length} identities of pool owners are fetched`);

  return JSON.stringify({ info: poolsInfo, nextPoolId: lastPoolId.addn(1).toString() });
}

onmessage = (e) => {
  const { endpoint } = e.data;

  // eslint-disable-next-line no-void
  void getPools(endpoint).then((poolsInfo) => {
    postMessage(poolsInfo);
  });
};
