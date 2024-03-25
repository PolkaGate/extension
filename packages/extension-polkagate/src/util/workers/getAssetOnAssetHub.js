// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { BN_ZERO } from '@polkadot/util';

import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

async function toGetNativeToken (addresses, api, chainName) {
  const tokenName = chainName.replace('AssetHub', '');
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  addresses.forEach((address, index) => {
    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    if (totalBalance.isZero()) {
      return;
    }

    _result[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
      availableBalance: String(balances[index].freeBalance),
      chainName,
      decimal: api.registry.chainDecimals[0],
      genesisHash: api.genesisHash.toString(),
      priceId: tokenName, // based on the fact that asset hubs native token price id is the same as their token names
      token: api.registry.chainTokens[0],
      totalBalance: String(totalBalance)
    }];
  });

  return _result;
}

async function getAssetOnAssetHub (addresses, assetsToBeFetched, chainName) {
  const endpoints = getChainEndpoints(chainName);
  const { api, connections } = await fastestEndpoint(endpoints, false);

  const results = await toGetNativeToken(addresses, api, chainName);

  const nonNativeAssets = assetsToBeFetched.filter((asset) => !asset.extras?.isNative);

  for (const asset of nonNativeAssets) {
    const maybeTheAssetOfAddresses = addresses.map((address) => api.query.assets.account(asset.id, address));
    const assetMetaData = api.query.assets.metadata(asset.id);

    const response = await Promise.all([assetMetaData, ...maybeTheAssetOfAddresses]);
    const metadata = response[0];
    const AssetOfAddresses = response.slice(1);

    const decimal = metadata.decimals.toNumber();
    const token = metadata.symbol.toHuman();

    AssetOfAddresses.forEach((_asset, index) => {
      const balance = _asset.isNone ? BN_ZERO : _asset.unwrap().balance;

      if (balance.isZero()) {
        return;
      }

      const item = {
        assetId: asset.id,
        availableBalance: String(balance), // TODO: needs more checks
        chainName,
        decimal,
        genesisHash: api.genesisHash.toString(),
        priceId: asset?.priceId,
        token,
        totalBalance: String(balance)
      };

      const _index = addresses[index];

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
