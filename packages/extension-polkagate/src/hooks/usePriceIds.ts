// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createAssets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { sanitizeChainName } from '../util';
import { TEST_NETS } from '../util/constants';
import useAllChains from './useAllChains';
import useSelectedChains from './useSelectedChains';

const assetsChains = createAssets();

interface priceIdInfo {
  genesisHash: string;
  symbol?: string;
  id: string;
}

export default function usePriceIds(): priceIdInfo[] | undefined | null {
  const selectedChains = useSelectedChains();
  const allChains = useAllChains();

  return useMemo(() => {
    const nonTestNetSelectedChains = selectedChains?.filter((genesisHash) => !TEST_NETS.includes(genesisHash));
    let selectedChainsChainName = nonTestNetSelectedChains?.map((genesisHash) => {
      const chainInfo = allChains.find(({ genesisHash: chainGenesisHash }) => chainGenesisHash === genesisHash);
      const id = sanitizeChainName(chainInfo?.chain)?.toLowerCase();

      if (!id) {
        return undefined;
      }

      return {
        genesisHash,
        id,
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
      ...(assetsInfoOfMultiAssetSelectedChains || [])
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
  }, [allChains, selectedChains]);
}
