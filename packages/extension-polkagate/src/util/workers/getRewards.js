// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import getApi from '../getApi.ts';

async function getRewards (endpoint, _stakerAddress) {
  console.log(` rewards worker is called for ${_stakerAddress}`);

  const api = await getApi(endpoint);

  const rewards = await api.derive.staking.stakerRewards(_stakerAddress, true);
  const nonEmptyRewards = rewards.filter((e) => !e.isEmpty);

  console.log('rewards in worker:', JSON.parse(JSON.stringify(rewards)));

  return nonEmptyRewards?.map((ne) => {
    let rewardInEra = 0n;

    for (const validator in ne.validators) {
      rewardInEra += ne.validators[validator]?.value?.toBigInt() || 0n;
    }

    return { era: ne.era.toNumber(), reward: rewardInEra };
  });
}

onmessage = (e) => {
  const { endpoint, stakerAddress } = e.data;

  // eslint-disable-next-line no-void
  void getRewards(endpoint, stakerAddress).then((myRewards) => {
    postMessage(myRewards);
  });
};
