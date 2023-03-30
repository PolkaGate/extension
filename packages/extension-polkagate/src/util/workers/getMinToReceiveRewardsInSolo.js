// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN, bnMin } from '@polkadot/util';

import getApi from '../getApi';

async function getMinToReceiveRewardsInSolo(endpoint) {
  const api = await getApi(endpoint);

  // a map of all nominators
  const assignments = new Map();
  const currentEra = (await api.query.staking.currentEra()).unwrap();
  const stakers = await api.query.staking.erasStakers.entries(currentEra);
  const token = api.registry.chainTokens[0];

  stakers.map((x) => x[1].others).flat().forEach((x) => {
    const nominatorAddress = String(x.who);
    const amount = new BN(String(x.value));

    if (assignments.get(nominatorAddress)) {
      assignments.set(nominatorAddress, amount.add(assignments.get(nominatorAddress)));
    } else {
      assignments.set(nominatorAddress, amount);
    }
  });

  return {
    eraIndex: Number(currentEra.toString()),
    minToGetRewards: bnMin(...assignments.values()).toString(),
    token
  };
}

onmessage = (e) => {
  const { endpoint } = e.data;

  // eslint-disable-next-line no-void
  void getMinToReceiveRewardsInSolo(endpoint).then((info) => {
    postMessage(info);
  });
};
