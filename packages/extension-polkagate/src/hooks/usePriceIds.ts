// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import useSelectedChains from './useSelectedChains';

const assetsChains = createAssets();

/**
 * @description To fetch assets priceIds for fetching their prices
 * @returns a list of priceIds like 'acala', 'polkadot, ...
 */
export default function usePriceIds (): string[] | undefined | null {
  const selectedChains = useSelectedChains();

  return useMemo(() => {
    const nonTestNetSelectedChains = selectedChains?.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
    let selectedChainsChainName = nonTestNetSelectedChains?.map((genesisHash) => getChainName(genesisHash));

    const assetsOnSelectedMultiAssetChains = selectedChainsChainName?.map((chainName) => chainName && assetsChains[chainName]?.map((asset) => asset?.priceId))?.flat().filter((item) => !!item);

    selectedChainsChainName = selectedChainsChainName?.map((item) => item?.replace('AssetHub', ''));
    const nonDuplicatedPriceIds = new Set([...(selectedChainsChainName || []), ...(assetsOnSelectedMultiAssetChains || [])]);

    return nonDuplicatedPriceIds.size ? [...nonDuplicatedPriceIds] as string[] : null;
  }, [selectedChains]);
}
