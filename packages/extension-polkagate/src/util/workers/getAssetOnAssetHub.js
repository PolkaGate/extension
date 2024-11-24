// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { decodeMultiLocation } from '../utils';
import { closeWebsockets, fastestEndpoint, getChainEndpoints, metadataFromApi, toGetNativeToken } from './utils';

//@ts-ignore
async function getAssets (addresses, api, assets, chainName, results) {
  try {
    for (const asset of assets) {
      const isForeignAssets = asset.isForeign;
      const section = isForeignAssets ? 'foreignAssets' : 'assets';
      const assetId = isForeignAssets ? decodeMultiLocation(asset.id) : asset.id;
      // @ts-ignore
      const maybeTheAssetOfAddresses = addresses.map((address) => api.query[section].account(assetId, address));
      const assetMetaData = api.query[section].metadata(assetId);

      const response = await Promise.all([assetMetaData, ...maybeTheAssetOfAddresses]);
      const metadata = response[0];
      const assetOfAddresses = response.slice(1);

      const decimal = metadata.decimals.toNumber();
      const token = metadata.symbol.toHuman();

      // @ts-ignore
      assetOfAddresses.forEach((_asset, index) => {
        const balance = _asset.isNone ? BN_ZERO : _asset.unwrap().balance;

        const isFrozen = isForeignAssets
          ? metadata.isFrozen.valueOf()
          : _asset.isSome && _asset.unwrap().status.valueOf().toString() === 'Frozen';

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
          isForeignAssets: !!isForeignAssets,
          priceId: asset?.priceId,
          token,
          totalBalance: _balance
        };

        const _index = addresses[index];

        results[_index]?.push(item) ?? (results[_index] = [item]);
      });
    }
  } catch (e) {
    console.error('Something went wrong while fetching assets', chainName, e);
  }
}

// @ts-ignore
async function getAssetOnAssetHub (addresses, assetsToBeFetched, chainName, userAddedEndpoints) {
  const endpoints = getChainEndpoints(chainName, userAddedEndpoints);

  const { api, connections } = await fastestEndpoint(endpoints);

  const result = metadataFromApi(api);

  postMessage(JSON.stringify(result));

  const results = await toGetNativeToken(addresses, api, chainName);

  // @ts-ignore
  const nonNativeAssets = assetsToBeFetched.filter((asset) => !asset.extras?.isNative);

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

  postMessage(JSON.stringify(results));
  closeWebsockets(connections);
}

onmessage = async (e) => {
  let { addresses, assetsToBeFetched, chainName, userAddedEndpoints } = e.data;

  if (!assetsToBeFetched) {
    console.warn(`getAssetOnAssetHub: No assets to be fetched on ${chainName}, but just Native Token`);

    assetsToBeFetched = [];
  }

  let tryCount = 1;

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      await getAssetOnAssetHub(addresses, assetsToBeFetched, chainName, userAddedEndpoints);

      tryCount = 0;

      return;
    } catch (error) {
      console.error(`getAssetOnAssetHub: Error while fetching assets on asset hubs, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage(undefined);
    }

    tryCount++;
  }
};
