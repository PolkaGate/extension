// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import getApi from '../getApi';

/**
 * @param {string} endpoint
 */
async function getAllValidators (endpoint) {
  console.log('getting validators info from ', endpoint);

  try {
    const api = await getApi(endpoint);

    if (!api) {
      console.error(' Something went wrong wile setting a connection.');

      return;
    }

    const infoProps = { withController: true, withDestination: true, withExposure: true, withLedger: true, withNominations: true, withPrefs: true };

    const at = await api.rpc.chain.getFinalizedHead();
    const apiAt = await api.at(at);
    const [elected, waiting, currentEra] = await Promise.all([
      api.derive.staking.electedInfo(infoProps),
      api.derive.staking.waitingInfo(infoProps),
      apiAt.query['staking']['currentEra']()
    ]);
    const nextElectedInfo = elected.info.filter((e) =>
      elected.nextElected.find((n) =>
        String(n) === String(e.accountId)
      ));

    return JSON.parse(JSON.stringify({
      current: nextElectedInfo,
      eraIndex: Number(currentEra),
      waiting: waiting.info
    }));
  } catch (error) {
    console.log('something went wrong while getting validators info, err:', error);

    return null;
  }
}

onmessage = (e) => {
  const { endpoint } = e.data;

  getAllValidators(endpoint)
    .then((info) => {
      postMessage(info);
    })
    .catch(console.error);
};
