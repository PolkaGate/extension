// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { DEFAULT_ASSETS } from '../util/defaultAssets';
import { OutputPrices, Price2 } from '../util/types';
import { useChain, useChainName } from '.';

/**
 *  @description Version 2 of the hook usePrice - retrieve the price of a token from local storage PRICES2
 * @param address : accounts substrate address
 * @param assetId : selected token asset id
 * @returns price : price of the token which the address is already switched to
 */
export default function usePrice (address: string, assetId?: number): Price2 | undefined {
  const [price, setPrice] = useState<Price2 | undefined>();
  const chainName = useChainName(address)?.toLocaleLowerCase();
  const chain = useChain(address);

  const [localSavedPrices, setLocalSavedPrices] = useState<OutputPrices>();

  useEffect(() => {
    chrome.storage.local.get('prices2', (res) => {
      const localSavedPrices = res?.prices2 as OutputPrices;

      setLocalSavedPrices(localSavedPrices);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key === 'prices') {
            setLocalSavedPrices(newValue as OutputPrices);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!chainName || !localSavedPrices) {
      return;
    }

    let assetPriceId: string | undefined;

    if (assetId !== undefined) {
      assetPriceId = DEFAULT_ASSETS.find((asset) => asset.genesisHash === chain?.genesisHash && asset.assetId === assetId)?.priceId;
    }

    const sanitizeName = assetPriceId ?? chainName.replace('westendassethub', 'westend').replace('kusamaassethub', 'kusama').replace('polkadotassethub', 'polkadot');
    const price = localSavedPrices?.prices[sanitizeName];

    if (price !== undefined && localSavedPrices.date) {
      setPrice({
        chainName,
        price,
        timestamp: localSavedPrices.date
      });
    }
  }, [address, assetId, chain?.genesisHash, chainName, localSavedPrices]);

  return price;
}
