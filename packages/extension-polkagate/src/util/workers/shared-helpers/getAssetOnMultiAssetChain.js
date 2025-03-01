// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getSubstrateAddress } from '../../utils';
// eslint-disable-next-line import/extensions
import { balancifyAsset, closeWebsockets, fastestEndpoint, getChainEndpoints, metadataFromApi, toGetNativeToken } from '../utils';

/**
 *
 * @param {import('@polkagate/apps-config/assets/types').Asset[]} assetsToBeFetched
 * @param {string[]} addresses
 * @param {string} chainName
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort} port
 */
export async function getAssetOnMultiAssetChain(assetsToBeFetched, addresses, chainName, userAddedEndpoints, port) {
  const endpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, connections } = await fastestEndpoint(endpoints);

  const { metadata } = metadataFromApi(api);

  console.info('Shared worker, metadata fetched and sent for chain:', chainName);
  port.postMessage(JSON.stringify({ functionName: 'getAssetOnMultiAssetChain', metadata }));

  const results = await toGetNativeToken(addresses, api, chainName);

  const maybeTheAssetOfAddresses = addresses.map((address) => api.query['tokens']['accounts'].entries(address));
  const balanceOfAssetsOfAddresses = await Promise.all(maybeTheAssetOfAddresses);

  balanceOfAssetsOfAddresses.flat().forEach((entry) => {
    if (!entry.length) {
      return;
    }

    // @ts-ignore
    const formatted = entry[0].toHuman()[0];
    const storageKey = entry[0].toString();

    // @ts-ignore
    const foundAsset = assetsToBeFetched.find((_asset) => {
      const currencyId = _asset?.extras?.['currencyIdScale'].replace('0x', '');

      return currencyId && storageKey.endsWith(currencyId);
    });

    const balance = entry[1];
    // @ts-ignore
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

      // @ts-ignore
      results[address]?.push(asset) ?? (results[address] = [asset]);
    } else {
      console.info(`NOTE: There is an asset on ${chainName} for ${formatted} which is not whitelisted. assetInfo`, storageKey, balance?.toHuman());
    }
  });

  console.info('Shared worker, account assets fetched and send on chain:', chainName);
  port.postMessage(JSON.stringify({ functionName: 'getAssetOnMultiAssetChain', results }));
  closeWebsockets(connections);
}
