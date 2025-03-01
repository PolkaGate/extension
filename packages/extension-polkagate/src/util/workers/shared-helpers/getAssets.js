// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BN_ZERO } from '@polkadot/util';

import { decodeMultiLocation } from '../../utils';

//@ts-ignore
export async function getAssets(addresses, api, assets, chainName, results) {
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
    console.error(`Something went wrong while fetching assets on ${chainName}`, e);
  }
}
