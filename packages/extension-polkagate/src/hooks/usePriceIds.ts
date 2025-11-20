// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useEffect, useMemo, useState } from 'react';

import { getStorage } from '../components/Loading';
import allChains from '../util/chains';
import { STORAGE_KEY, TEST_NETS } from '../util/constants';
import getChainName from '../util/getChainName';
import useSelectedChains from './useSelectedChains';

const assetsChains = createAssets();

interface priceIdInfo {
  genesisHash: string;
  symbol?: string;
  id: string;
}

export default function usePriceIds (): priceIdInfo[] | undefined | null {
  const selectedChains = useSelectedChains();
  const [userAddedPriceIds, setUserAddedPriceIds] = useState<priceIdInfo[]>([]);

  useEffect(() => {
    getStorage(STORAGE_KEY.USER_ADDED_ENDPOINT).then((info) => {
      if (info) {
        const maybePriceIds = Object.entries(info).map(([genesisHash, { priceId }]) => ({
          genesisHash,
          id: priceId as string
        })).filter(Boolean);

        maybePriceIds?.length && setUserAddedPriceIds(maybePriceIds);
      }
    }).catch(console.error);
  }, []);

  return useMemo(() => {
    const nonTestNetSelectedChains = selectedChains?.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
    let selectedChainsChainName = nonTestNetSelectedChains?.map((genesisHash) => {
      const maybeChainName = getChainName(genesisHash);

      if (!maybeChainName) {
        return undefined;
      }

      const chainInfo = allChains.find(({ genesisHash: chainGenesisHash }) => chainGenesisHash === genesisHash);

      return {
        genesisHash,
        id: maybeChainName.toLowerCase(),
        symbol: chainInfo?.tokenSymbol ?? 'Unit'
      };
    }).filter((i) => !!i);

    const assetsInfoOfMultiAssetSelectedChains = selectedChainsChainName?.map(({ genesisHash, id }) =>
      id && assetsChains[id]?.map((asset) => {
        if (!asset.priceId) {
          return undefined;
        }

        return {
          genesisHash,
          id: asset.priceId,
          symbol: asset.symbol
        };
      }))
      ?.flat().filter((i) => !!i);

    selectedChainsChainName = selectedChainsChainName?.map((item) => {
      item.id = item.id.replace('AssetHub', '');

      return item;
    }); // TODO: needs double check

    const merged = [
      ...(selectedChainsChainName || []),
      ...(assetsInfoOfMultiAssetSelectedChains || []),
      ...userAddedPriceIds
    ];

    // Deduplicate based on `id`, keeping the first occurrence
    const seen = new Set<string>();
    const nonDuplicatedPriceIds = merged.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);

      return true;
    });

    return nonDuplicatedPriceIds.length ? [...nonDuplicatedPriceIds] : null;
  }, [selectedChains, userAddedPriceIds]);
}
