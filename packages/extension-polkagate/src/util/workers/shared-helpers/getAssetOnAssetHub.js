// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { closeWebsockets, fastestEndpoint, getChainEndpoints, metadataFromApi, toGetNativeToken } from '../utils';
import { getAssets } from './getAssets.js';

/**
 *
 * @param {string[]} addresses
 * @param {import('@polkagate/apps-config/assets/types').Asset[]} assetsToBeFetched
 * @param {string} chainName
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort} port
 */
export async function getAssetOnAssetHub(addresses, assetsToBeFetched, chainName, userAddedEndpoints, port) {
  const endpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, connections } = await fastestEndpoint(endpoints);

  const { metadata } = metadataFromApi(api);

  console.info('Shared worker, metadata fetched and sent for chain:', chainName);
  port.postMessage(JSON.stringify({ functionName: 'getAssetOnAssetHub', metadata }));

  const results = await toGetNativeToken(addresses, api, chainName);

  // @ts-ignore
  const nonNativeAssets = (assetsToBeFetched || []).filter((asset) => !asset.extras?.isNative);

  /** to calculate a new Foreign Token like MYTH asset id based on its XCM multi-location */
  // const allForeignAssets = await api.query.foreignAssets.asset.entries();
  // for (const [key, _others] of allForeignAssets) {
  //   const id = key.args[0];
  //   const assetMetaData = await api.query.foreignAssets.metadata(id);

  //   if (assetMetaData.toHuman().symbol === 'MYTH') {
  //     console.log('new foreign asset id:', encodeMultiLocation(id));
  //   }
  // }

  await getAssets(addresses, api, nonNativeAssets, chainName, results);

  console.info('Shared worker, account assets fetched and send on chain:', chainName);
  port.postMessage(JSON.stringify({ functionName: 'getAssetOnAssetHub', results }));
  closeWebsockets(connections);
}
