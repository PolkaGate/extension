// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable import-newlines/enforce */
/* eslint-disable object-curly-newline */

import { createAssets } from '@polkagate/apps-config/assets';

import { getSubstrateAddress } from '../utils';
import { closeWebsockets, fastestEndpoint, getChainEndpoints } from './utils';

function balancify (balances) {
  return JSON.stringify({
    availableBalance: String(balances.availableBalance),
    freeBalance: String(balances.freeBalance),
    lockedBalance: String(balances.lockedBalance),
    reservedBalance: String(balances.reservedBalance),
    vestedBalance: String(balances.vestedBalance),
    vestedClaimable: String(balances.vestedClaimable),
    vestingLocked: String(balances.vestingLocked),
    vestingTotal: String(balances.vestingTotal),
    votingBalance: String(balances.votingBalance)
  });
}

function balancifyAsset (balances) {
  return JSON.stringify({
    availableBalance: String(balances.free),
    frozenBalance: String(balances.frozen),
    reservedBalance: String(balances.reserved)
  });
}

export async function toGetNativeToken (addresses, api, chainName) {
  const _result = {};

  const balances = await Promise.all(addresses.map((address) => api.derive.balances.all(address)));

  addresses.forEach((address, index) => {
    const totalBalance = balances[index].freeBalance.add(balances[index].reservedBalance);

    if (totalBalance.isZero()) {
      return;
    }

    _result[address] = [{
      balanceDetails: balancify(balances[index]),
      chainName,
      decimal: api.registry.chainDecimals[0],
      genesisHash: api.genesisHash.toString(),
      priceId: chainName.toLowerCase(), // based on the fact that chains native token price id is the same as their chain names
      token: api.registry.chainTokens[0],
      totalBalance: String(totalBalance)
    }];
  });

  return _result;
}

async function getAssetOnHydraDx (addresses, assetsToBeFetched, chainName) {
  const endpoints = getChainEndpoints(chainName);
  const { api, connections } = await fastestEndpoint(endpoints, false);

  const results = await toGetNativeToken(addresses, api, chainName);

  const maybeTheAssetOfAddresses = addresses.map((address) => api.query.tokens.accounts.entries(address));
  const balanceOfAssetsOfAddresses = await Promise.all(maybeTheAssetOfAddresses);

  balanceOfAssetsOfAddresses.forEach((entry) => {
    const formatted = entry[0][0].toHuman()[0];
    const storageKey = entry[0][0].toString();

    const foundAsset = assetsToBeFetched.find((_asset) => {
      const currencyId = _asset?.extras?.currencyIdScale.replace('0x', '');

      return currencyId && storageKey.endsWith(currencyId);
    });

    const balance = entry[0][1];
    const totalBalance = balance.free.add(balance.reserved);

    if (foundAsset) {
      const asset = {
        assetId: foundAsset.id,
        balanceDetails: balancifyAsset(balance),
        chainName,
        decimal: foundAsset.decimal,
        formatted,
        genesisHash: api.genesisHash.toString(),
        priceId: foundAsset?.priceId,
        token: foundAsset.symbol,
        totalBalance: String(totalBalance)
      };

      const address = getSubstrateAddress(formatted);

      results[address]?.push(asset) ?? (results[address] = [asset]);
    }
  });

  postMessage(JSON.stringify(results));
  closeWebsockets(connections);
}

onmessage = async (e) => {
  const { addresses } = e.data;

  const assetsChains = createAssets();
  const chainName = 'hydraDX';

  const assetsToBeFetched = assetsChains[chainName];

  /** if assetsToBeFetched === undefined then we don't fetch assets by default at first, but wil fetch them on-demand later in account details page*/
  if (!assetsToBeFetched) {
    console.info(`getAssetOnHydraDx: No assets to be fetched on ${chainName}`);

    return postMessage(undefined); // FIXME: if this happens, should be handled in caller
  }

  let tryCount = 1;

  console.log(`getAssetOnHydraDx: try ${tryCount} to fetch assets on ${chainName}.`);

  while (tryCount >= 1 && tryCount <= 5) {
    try {
      await getAssetOnHydraDx(addresses, assetsToBeFetched, chainName);

      tryCount = 0;

      return;
    } catch (error) {
      console.error(`getAssetOnHydraDx: Error while fetching assets on hydraDx, ${5 - tryCount} times to retry`, error);

      tryCount === 5 && postMessage(undefined);
    }

    tryCount++;
  }
};
