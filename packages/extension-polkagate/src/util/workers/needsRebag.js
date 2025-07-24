// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

// @ts-nocheck

import getApi from '../getApi.ts';

async function needsRebag(endpoint, currentAccount) {
  console.log(`NeedsRebag is called for id: ${currentAccount}`);

  const api = await getApi(endpoint);

  if (!api) {
    console.error('Failed to get api!');

    return;
  }

  const at = await api.rpc.chain.getFinalizedHead();
  const apiAt = await api.at(at);

  const unwrappedCurrentCtrl = await apiAt.query.staking.bonded(currentAccount);
  const currentCtrl = unwrappedCurrentCtrl.isSome ? unwrappedCurrentCtrl.unwrap() : undefined;

  if (!currentCtrl) {
    // account does not have staked yet
    return { currentBagThreshold: '0.00 DOT', shouldRebag: false };
  }

  const renameConsistentApi = apiAt.query?.['bagsList'] || apiAt.query?.['voterList'];

  const currentWeight = api.createType('Balance', (await apiAt.query.staking['ledger'](currentCtrl)).unwrapOrDefault().active);
  const unwrappedCurrentNode = await renameConsistentApi['listNodes'](currentCtrl);
  const currentNode = unwrappedCurrentNode?.isSome ? unwrappedCurrentNode?.unwrap() : undefined;

  if (!currentNode) {
    // account probably has done stopNominated
    return { currentBagThreshold: '0.00 DOT', shouldRebag: false };
  }

  const currentUpper = api.createType('Balance', currentNode.bagUpper);

  return {
    currentUpper: currentUpper.toHuman(),
    currentWeight: currentWeight.toHuman(),
    shouldRebag: currentWeight.gt(currentUpper)
  };
}

onmessage = (e) => {
  const { endpoint, stakerAddress } = e.data;

  // eslint-disable-next-line no-void
  void needsRebag(endpoint, stakerAddress).then((rebag) => {
    postMessage(rebag);
  });
};
