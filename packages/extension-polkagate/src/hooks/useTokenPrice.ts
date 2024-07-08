// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { toCamelCase } from '../fullscreen/governance/utils/util';
import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID } from '../util/constants';
import type { Price } from '../util/types';
import { useChain, useChainName, usePrices } from '.';
import { getPriceIdByChainName } from '../util/utils';

const DEFAULT_PRICE = {
  price: undefined,
  priceChainName: undefined,
  priceDate: undefined
};

const assetsChains = createAssets();

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @returns price : price of the token which the address is already switched to
 */
export default function useTokenPrice(address: string, assetId?: number): Price | typeof DEFAULT_PRICE {
  const chainName = useChainName(address);
  const chain = useChain(address);
  const isAssetHub = ASSET_HUBS.includes(chain?.genesisHash || '');

  const pricesInCurrencies = usePrices();
  const mayBeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];

  const _assetId = assetId !== undefined
    ? assetId
    : isAssetHub
      ? NATIVE_TOKEN_ASSET_ID
      : undefined;

  return useMemo(() => {
    if (!chainName || !pricesInCurrencies) {
      return DEFAULT_PRICE;
    }

    // FixMe, on second fetch of asset id its type will get string which is weird!!
    const priceId = _assetId !== undefined && _assetId > NATIVE_TOKEN_ASSET_ID
      ? mayBeAssetsOnMultiAssetChains?.find(({ id }) => id === Number(_assetId))?.priceId
      : getPriceIdByChainName(chainName);

    const mayBePriceValue = priceId ? pricesInCurrencies.prices?.[priceId]?.value || 0 : 0;

    return {
      price: mayBePriceValue,
      priceChainName: chainName?.toLocaleLowerCase(),
      priceDate: pricesInCurrencies.date
    };
  }, [_assetId, chainName, mayBeAssetsOnMultiAssetChains, pricesInCurrencies]);
}
