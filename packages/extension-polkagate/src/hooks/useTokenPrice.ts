// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Price } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { useUserAddedPriceId } from '../fullscreen/addNewChain/utils';
import { toCamelCase } from '../fullscreen/governance/utils/util';
import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../util/constants';
import { getPriceIdByChainName } from '../util/utils';
import { useInfo, usePrices } from '.';

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
export default function useTokenPrice (address: string | undefined, assetId?: number | string): Price | typeof DEFAULT_PRICE {
  const { chainName, genesisHash } = useInfo(address);
  const userAddedPriceId = useUserAddedPriceId(genesisHash);
  const pricesInCurrencies = usePrices();
  const maybeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];

  const isAssetHub = ASSET_HUBS.includes(genesisHash || '');

  const _assetId = useMemo(() =>
    assetId !== undefined
      ? assetId
      : isAssetHub
        ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB
        : undefined
  , [assetId, isAssetHub]);

  return useMemo(() => {
    if (!chainName || !pricesInCurrencies) {
      return DEFAULT_PRICE;
    }

    // FixMe, on second fetch of asset id its type will get string which is weird!!
    const priceId = _assetId !== undefined && ((typeof _assetId === 'number' && _assetId > NATIVE_TOKEN_ASSET_ID) || isAssetHub)
      ? maybeAssetsOnMultiAssetChains?.find(({ id }) => id === Number(_assetId) || id === _assetId)?.priceId
      : userAddedPriceId || getPriceIdByChainName(chainName);

    const maybePriceValue = priceId ? pricesInCurrencies.prices?.[priceId]?.value || 0 : 0;

    return {
      price: maybePriceValue,
      priceChainName: chainName?.toLocaleLowerCase(),
      priceDate: pricesInCurrencies.date
    };
  }, [_assetId, chainName, isAssetHub, maybeAssetsOnMultiAssetChains, pricesInCurrencies, userAddedPriceId]);
}
