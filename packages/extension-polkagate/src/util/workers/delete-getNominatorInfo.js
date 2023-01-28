// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN, bnMin } from '@polkadot/util';

import getApi from '../getApi';

async function getNominatorInfo(endpoint, _nominatorAddress) {
  const api = await getApi(endpoint);

  // a map of all nominators
  const assignments = new Map();
  const currentEra = (await api.query.staking.currentEra()).unwrap();
  const stakers = await api.query.staking.erasStakers.entries(currentEra);

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
    eraIndex: currentEra,
    isInList: !!assignments.get(_nominatorAddress),
    minNominated: bnMin(...assignments.values())
  };
}

onmessage = (e) => {
  const { endpoint, stakerAddress } = e.data;

  // eslint-disable-next-line no-void
  void getNominatorInfo(endpoint, stakerAddress).then((info) => {
    postMessage(info);
  });
};
