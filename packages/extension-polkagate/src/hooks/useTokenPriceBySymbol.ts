// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { useUserAddedPriceId } from '../fullscreen/addNewChain/utils';
import { getPriceIdByChainName, toCamelCase } from '../util';
import useChainInfo from './useChainInfo';
import usePrices from './usePrices';

export const DEFAULT_PRICE = {
  price: undefined,
  priceDate: undefined
};

export interface Price {
  price: number | undefined,
  priceDate: number | undefined;
}

const assetsChains = createAssets();

/**
 *  @description retrieve the price of a token from local storage PRICES
 * @param address : accounts substrate address
 * @param assetId : asset id on multi asset chains
 * @param assetChainName : chain name to fetch asset id price from
 * @returns price : price of the token which the address is already switched to
 */
export default function useTokenPriceBySymbol (tokenSymbol: string | undefined, genesisHash: string | undefined): Price {
  const { chainName } = useChainInfo(genesisHash, true);
  const userAddedPriceId = useUserAddedPriceId(genesisHash);
  const pricesInCurrencies = usePrices();
  const maybeAssetsOnMultiAssetChains = assetsChains[toCamelCase(chainName || '')];

  return useMemo(() => {
    if (!chainName || !pricesInCurrencies || !tokenSymbol || !genesisHash) {
      return DEFAULT_PRICE;
    }

    // FixMe, on second fetch of asset id its type will get string which is weird!!
    const maybeAssetInfo = maybeAssetsOnMultiAssetChains?.find(({ symbol }) => symbol.toLowerCase() === tokenSymbol.toLowerCase()) ?? undefined;

    const priceId = maybeAssetInfo?.priceId || userAddedPriceId || getPriceIdByChainName(chainName);

    const maybePriceValue = priceId ? pricesInCurrencies.prices?.[priceId]?.value || 0 : 0;

    return {
      price: maybePriceValue,
      priceDate: pricesInCurrencies.date
    };
  }, [chainName, genesisHash, maybeAssetsOnMultiAssetChains, pricesInCurrencies, tokenSymbol, userAddedPriceId]);
}
