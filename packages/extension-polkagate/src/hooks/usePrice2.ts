// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import { CurrencyContext, PricesContext } from '../components';
import { DEFAULT_ASSETS } from '../util/defaultAssets';
import { Price2 } from '../util/types';
import { useChain, useChainName } from '.';

/**
 *  @description Version 2 of the hook usePrice - retrieve the price of a token from local storage PRICES2
 * @param address : accounts substrate address
 * @param assetId : selected token asset id
 * @returns price : price of the token which the address is already switched to
 */
export default function usePrice(address: string, assetId?: number): Price2 | undefined {
  const { prices } = useContext(PricesContext);
  const { currency } = useContext(CurrencyContext);
  const [price, setPrice] = useState<Price2 | undefined>();
  const chainName = useChainName(address)?.toLocaleLowerCase();
  const chain = useChain(address);

  useEffect(() => {
    if (!chainName || !prices) {
      return;
    }

    let assetPriceId: string | undefined;

    if (assetId !== undefined) {
      assetPriceId = DEFAULT_ASSETS.find((asset) => asset.genesisHash === chain?.genesisHash && asset.assetId === assetId)?.priceId;
    }

    const sanitizeName = assetPriceId ?? chainName.replace('westendassethub', 'westend').replace('kusamaassethub', 'kusama').replace('polkadotassethub', 'polkadot');
    // const price = localSavedPrices?.prices[sanitizeName];
    const price = prices.find((price) => price.currencyCode.toLowerCase() === currency?.code?.toLowerCase());

    if (price !== undefined) {
      setPrice({
        chainName,
        price: price.prices[sanitizeName].price,
        timestamp: price.date
      });
    }
  }, [assetId, chain?.genesisHash, chainName, currency?.code, prices]);

  return price;
}
