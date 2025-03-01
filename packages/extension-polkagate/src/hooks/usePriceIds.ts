// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useEffect, useMemo, useState } from 'react';

import { getStorage } from '../components/Loading';
import { TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import useSelectedChains from './useSelectedChains';

const assetsChains = createAssets();

/**
 * @description To fetch assets priceIds for fetching their prices
 * @returns a list of priceIds like 'acala', 'polkadot, ...
 */
export default function usePriceIds(): string[] | undefined | null {
  const selectedChains = useSelectedChains();
  const [userAddedPriceIds, setUserAddedPriceIds] = useState<string[]>([]);

  useEffect(() => {
    getStorage('userAddedEndpoint').then((info) => {
      if (info) {
        const maybePriceIds: string[] | undefined = Object.entries(info).map(([_, { priceId }]) => priceId as string).filter(Boolean);

        maybePriceIds?.length && setUserAddedPriceIds(maybePriceIds);
      }
    }).catch(console.error);
  }, []);

  return useMemo(() => {
    const nonTestNetSelectedChains = selectedChains?.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
    let selectedChainsChainName = nonTestNetSelectedChains?.map((genesisHash) => getChainName(genesisHash)).filter(Boolean);

    const assetsInfoOfMultiAssetSelectedChains = selectedChainsChainName?.map((chainName) => chainName && assetsChains[chainName]?.map((asset) => asset?.priceId))?.flat().filter((item) => !!item);

    selectedChainsChainName = selectedChainsChainName?.map((item) => item?.replace('AssetHub', '')); // TODO: needs double check
    const nonDuplicatedPriceIds = new Set([...(selectedChainsChainName || []), ...(assetsInfoOfMultiAssetSelectedChains || []), ...userAddedPriceIds]);

    return nonDuplicatedPriceIds.size ? [...nonDuplicatedPriceIds] as string[] : null;
  }, [selectedChains, userAddedPriceIds]);
}
