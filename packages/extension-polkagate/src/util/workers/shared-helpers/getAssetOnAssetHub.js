// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FETCHING_ASSETS_FUNCTION_NAMES } from '../../constants';
import { closeWebsockets, fastestEndpoint, getChainEndpoints, metadataFromApi, newRefNotif, toGetNativeToken } from '../utils';
import { getAssets } from './getAssets.js';

/**
 *
 * @param {string[]} addresses
 * @param {import('@polkagate/apps-config/assets/types').Asset[]} assetsToBeFetched
 * @param {string} chainName
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort} port
 */
export async function getAssetOnAssetHub (addresses, assetsToBeFetched, chainName, userAddedEndpoints, port) {
  const endpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, connections } = await fastestEndpoint(endpoints);

  const { metadata } = metadataFromApi(api);

  console.info(chainName, 'metadata : fetched and saved.');
  port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.ASSET_HUB, metadata }));

  const results = await toGetNativeToken(addresses, api, chainName);

  // @ts-ignore
  const nonNativeAssets = (assetsToBeFetched || []).filter((asset) => !asset.extras?.isNative);

  /** to calculate a new Foreign Token like MYTH asset id based on its XCM multi-location */
  // const allForeignAssets = await api.query.foreignAssets.asset.entries();
  // for (const [key, _others] of allForeignAssets) {
  //   const id = key.args[0];
  //   const assetMetaData = await api.query.foreignAssets.metadata(id);

  //   if (assetMetaData.toHuman().symbol === 'MYTH') {
  //     console.log('new foreign asset id:', encodeLocation(id));
  //   }
  // }

  await getAssets(addresses, api, nonNativeAssets, chainName, results);
  await newRefNotif(api, chainName, port);

  console.info(chainName, ': account assets fetched.');
  port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.ASSET_HUB, results }));
  closeWebsockets(connections);
}
