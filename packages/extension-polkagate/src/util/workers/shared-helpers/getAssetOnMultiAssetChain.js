// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
import { getAssetsObject } from '@paraspell/sdk-pjs';

import { getSubstrateAddress } from '../../address';
import { FETCHING_ASSETS_FUNCTION_NAMES } from '../../constants';
import { toTitleCase } from '../../string';
// eslint-disable-next-line import/extensions
import { balancifyAsset, fastestEndpoint, getChainEndpoints, metadataFromApi, toGetNativeToken } from '../utils';

/**
 *
 * @param {import('@polkagate/apps-config/assets/types').Asset[]} assetsToBeFetched
 * @param {string[]} addresses
 * @param {string} chainName
 * @param {import('../../types').UserAddedChains} userAddedEndpoints
 * @param {MessagePort} port
 */
export async function getAssetOnMultiAssetChain (assetsToBeFetched, addresses, chainName, userAddedEndpoints, port) {
  const endpoints = getChainEndpoints(chainName, userAddedEndpoints);
  const { api, webSocket } = await fastestEndpoint(endpoints);

  const { metadata } = metadataFromApi(api);

  console.info(chainName, 'metadata : fetched and saved.');
  port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.MULTI_ASSET, metadata }));

  const results = await toGetNativeToken(addresses, api, chainName);

  const maybeTheAssetOfAddresses = addresses.map((address) => api.query['tokens']['accounts'].entries(address));
  const balanceOfAssetsOfAddresses = await Promise.all(maybeTheAssetOfAddresses);

  balanceOfAssetsOfAddresses.flat().forEach((entry) => {
    if (!entry.length) {
      return;
    }

    const [formatted, assetIdRaw] = entry[0].toHuman() ?? [];

    let assetId;

    if (typeof assetIdRaw === 'object') {
      assetId = JSON.stringify(assetIdRaw);
    } else {
      // ensure assetId is a string and remove commas
      assetId = assetIdRaw?.toString().replace(/,/g, '');
    }

    const storageKey = entry[0].toString();

    let maybeAssetInfo = assetsToBeFetched.find((_asset) => {
      const currencyId = _asset?.extras?.['currencyIdScale'].replace('0x', '');

      return currencyId && storageKey.endsWith(currencyId);
    });

    const balance = entry[1];

    if (!maybeAssetInfo) {
      const assetObj = getAssetsObject(toTitleCase(chainName));

      if (assetObj) {
        const maybeAssetId = entry[0].toHuman()[1].replace(/,/g, '');

        const assets = assetObj.nativeAssets.concat(assetObj.otherAssets);

        maybeAssetInfo = assets.find(({ assetId }) => assetId === maybeAssetId);

        if (maybeAssetInfo) {
          maybeAssetInfo.id = maybeAssetInfo.assetId;
          maybeAssetInfo.decimal = maybeAssetInfo.decimals;
          console.log(' found:', maybeAssetInfo);
        }
      }
    }

    if (maybeAssetInfo) {
      const totalBalance = balance.free.add(balance.reserved);

      const asset = {
        ED: maybeAssetInfo?.extras?.existentialDeposit ?? maybeAssetInfo?.existentialDeposit,
        assetId: assetId ?? maybeAssetInfo.id,
        balanceDetails: balancifyAsset(balance),
        chainName,
        decimal: maybeAssetInfo.decimal,
        formatted,
        genesisHash: api.genesisHash.toString(),
        priceId: maybeAssetInfo?.priceId,
        token: maybeAssetInfo.symbol,
        totalBalance: String(totalBalance)
      };

      const address = getSubstrateAddress(formatted);

      results[address]?.push(asset) ?? (results[address] = [asset]);
    } else {
      console.info(`NOTE: There is an asset on ${chainName} for ${formatted} which is not whitelisted. assetInfo`, storageKey, balance?.toHuman());
    }
  });

  console.info(chainName, ': account assets fetched.');
  port.postMessage(JSON.stringify({ functionName: FETCHING_ASSETS_FUNCTION_NAMES.MULTI_ASSET, results }));

  webSocket.disconnect().catch(console.error);
}
