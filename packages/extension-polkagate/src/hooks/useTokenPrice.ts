// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Price } from '../util/types';

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { useUserAddedPriceId } from '../fullscreen/addNewChain/utils';
import { toCamelCase } from '../util';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../util/constants';
import { getPriceIdByChainName, isOnAssetHub } from '../util/utils';
import useChainInfo from './useChainInfo';
import usePrices from './usePrices';

const DEFAULT_PRICE = {
  decimal: undefined,
  price: undefined,
  priceChainName: undefined,
  priceDate: undefined,
  token: undefined
};

const assetsChains = createAssets();

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param genesisHash : the chain's genesisHash on which token resides
 * @param assetId : asset id on multi asset chains
 * @param assetChainName : chain name to fetch asset id price from
 * @returns price : price of the token which the address is already switched to
 */
export default function useTokenPrice (genesisHash: string | undefined, assetId?: number | string, assetChainName?: string): Price | typeof DEFAULT_PRICE {
  const { chainName: addressChainName, decimal, token } = useChainInfo(genesisHash, true);
  const userAddedPriceId = useUserAddedPriceId(genesisHash);
  const pricesInCurrencies = usePrices();
  const _chainName = assetChainName || addressChainName;
  const maybeAssetsOnMultiAssetChains = assetsChains[toCamelCase(_chainName || '')];

  const isAssetHub = isOnAssetHub(genesisHash || '');

  const _assetId = useMemo(() =>
    assetId !== undefined
      ? assetId
      : isAssetHub
        ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB
        : undefined
    , [assetId, isAssetHub]);

  return useMemo(() => {
    if (!_chainName || !pricesInCurrencies || !token || !decimal) {
      return DEFAULT_PRICE;
    }

    // FixMe, on second fetch of asset id its type will get string which is weird!!
    const maybeAssetInfo = _assetId !== undefined && ((typeof _assetId === 'number' && _assetId > NATIVE_TOKEN_ASSET_ID) || isAssetHub)
      ? maybeAssetsOnMultiAssetChains?.find(({ id }) => id === Number(_assetId) || id === _assetId)
      : undefined;

    const priceId = maybeAssetInfo?.priceId || userAddedPriceId || getPriceIdByChainName(_chainName);

    const maybePriceValue = priceId ? pricesInCurrencies.prices?.[priceId]?.value || 0 : 0;
    const _decimal = maybeAssetInfo?.decimal || decimal;
    const _token = maybeAssetInfo?.symbol || token;

    return {
      decimal: _decimal,
      price: maybePriceValue,
      priceChainName: _chainName?.toLocaleLowerCase(),
      priceDate: pricesInCurrencies.date,
      token: _token
    };
  }, [_assetId, _chainName, decimal, isAssetHub, maybeAssetsOnMultiAssetChains, pricesInCurrencies, token, userAddedPriceId]);
}
