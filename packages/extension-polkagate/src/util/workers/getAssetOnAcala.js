// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { options } from '@acala-network/api';
import { createAssets } from '@polkagate/apps-config/assets';

import { BN_ZERO } from '@polkadot/util';

import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

async function toGetNativeToken(addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  addresses.forEach((address, index) => {
    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    if (totalBalance.isZero()) {
      return;
    }

    _result[address] = [{ // since some chains may have more than one asset hence we use an array here! even thought its not needed for relay chains but just to be as a general rule.
      chainName,
      decimal: api.registry.chainDecimals[0],
      genesisHash: api.genesisHash.toString(),
      priceId: chainName, // based on the fact that chains native token price id is the same as their chain names
      token: api.registry.chainTokens[0],
      totalBalance: String(totalBalance)
    }];
  });

  return _result;
}

async function getAssetOnAcala(addresses, assetsToBeFetched, chainName) {
  const endpoints = getChainEndpoints(chainName);
  const { api, connections } = await fastestEndpoint(endpoints, false);

  const results = await toGetNativeToken(addresses, api, chainName);

  const nonNativeAssets = assetsToBeFetched.slice(1);

  for (const asset of nonNativeAssets) {
    const maybeTheAssetOfAddresses = addresses.map((address) => api.query.tokens.accounts(address, { Token: asset.symbol === 'aSEED' ? 'ausd' : asset.symbol.toLowerCase() }));

    const balanceOfAssetsOfAddresses = await Promise.all(maybeTheAssetOfAddresses);

    balanceOfAssetsOfAddresses.forEach((balance, index) => {
      const totalBalance = balance.free.add(balance.reserved);

      if (totalBalance.isZero()) {
        return;
      }

      const item = {
        assetId: asset.id,
        chainName,
        decimal: asset.decimal,
        genesisHash: api.genesisHash.toString(),
        priceId: asset?.priceId,
        token: asset.symbol,
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
  const { addresses } = e.data;

  const assetsChains = createAssets();
  const chainName = 'acala';
  const acalaFilteredSymbols = ['lcDOT', 'GLMR', 'PARA', 'tDOT', 'INTR', 'ASTR', 'EQ', 'iBTC', 'DAI', 'USDT'];
  const assetsToBeFetched = assetsChains[chainName].filter(({ symbol }) => !acalaFilteredSymbols.includes(symbol));

  /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but wil fetch them on-demand later in account details page*/
  if (!assetsToBeFetched) {
    console.info(`getAssetOnAcala: No assets to be fetched on ${chainName}`);

    return postMessage(undefined);
  }

  console.info('getAssetOnAcala:  assets to be fetched', assetsToBeFetched);

  let tryCount = 1;

  console.log(`getAssetOnAcala: try ${tryCount} to fetch assets on ${chainName}.`);

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      await getAssetOnAcala(addresses, assetsToBeFetched, chainName);

      tryCount = 0;

      return;
    } catch (error) {
      console.error(`getAssetOnAcala: Error while fetching assets on acala, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage(undefined);
    }

    tryCount++;
  }
};
