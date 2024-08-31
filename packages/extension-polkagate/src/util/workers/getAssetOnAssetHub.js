// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { BN_ZERO } from '@polkadot/util';

// eslint-disable-next-line import/extensions
import { closeWebsockets, fastestEndpoint, getChainEndpoints, getMetadata, toGetNativeToken } from './utils';

// @ts-ignore
async function getAssetOnAssetHub(addresses, assetsToBeFetched, chainName) {
  const endpoints = getChainEndpoints(chainName);
  const { api, connections } = await fastestEndpoint(endpoints, false);

  const result = getMetadata(api);

  postMessage(JSON.stringify(result));

  const results = await toGetNativeToken(addresses, api, chainName);

  // @ts-ignore
  const nonNativeAssets = assetsToBeFetched.filter((asset) => !asset.extras?.isNative);

  for (const asset of nonNativeAssets) {
    // @ts-ignore
    const maybeTheAssetOfAddresses = addresses.map((address) => api.query.assets.account(asset.id, address));
    const assetMetaData = api.query.assets.metadata(asset.id);

    const response = await Promise.all([assetMetaData, ...maybeTheAssetOfAddresses]);
    const metadata = response[0];
    const AssetOfAddresses = response.slice(1);

    const decimal = metadata.decimals.toNumber();
    const token = metadata.symbol.toHuman();

    AssetOfAddresses.forEach((_asset, index) => {
      const balance = _asset.isNone ? BN_ZERO : _asset.unwrap().balance;
      const parsedAccountAsset = JSON.parse(JSON.stringify(_asset));
      const isFrozen = parsedAccountAsset?.status === 'Frozen';
      const _balance = String(balance);

      const item = {
        assetId: asset.id,
        balanceDetails: {
          availableBalance: isFrozen ? 0 : _balance,
          lockedBalance: isFrozen ? _balance : 0,
          reservedBalance: isFrozen ? balance : 0 // JUST to comply with the rule that total=available + reserve
        },
        chainName,
        decimal,
        freeBalance: isFrozen ? 0 : _balance, // JUST to comply with the rule ...
        frozenBalance: isFrozen ? balance : 0, // JUST to comply with the rule that total=available + reserve
        genesisHash: api.genesisHash.toString(),
        isAsset: true,
        priceId: asset?.priceId,
        token,
        totalBalance: _balance
      };

      const _index = addresses[index];

      // @ts-ignore
      results[_index]?.push(item) ?? (results[_index] = [item]);
    });
  }

  postMessage(JSON.stringify(results));
  closeWebsockets(connections);
}

onmessage = async (e) => {
  const { addresses, assetsToBeFetched, chainName } = e.data;

  /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but wil fetch them on-demand later in account details page*/
  if (!assetsToBeFetched) {
    console.warn(`getAssetOnAssetHub: No assets to be fetched on ${chainName}`);

    return postMessage(undefined);
  }

  let tryCount = 1;

  console.log(`getAssetOnAssetHub: try ${tryCount} to fetch assets on ${chainName}.`);

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      await getAssetOnAssetHub(addresses, assetsToBeFetched, chainName);

      tryCount = 0;

      return;
    } catch (error) {
      console.error(`getAssetOnAssetHub: Error while fetching assets on asset hubs, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage(undefined);
    }

    tryCount++;
  }
};
