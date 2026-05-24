// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ERC20Asset } from '@polkagate/apps-config/assets/evm/types.js';

import { createAssets, createErc20Assets } from '@polkagate/apps-config/assets';
import { useMemo } from 'react';

import { sanitizeChainName } from '../util';
import useAllChains from './useAllChains';

const assetsChains = createAssets();
const erc20Assets = createErc20Assets() as ERC20Asset[];

interface priceIdInfo {
  genesisHash?: string;
  symbol: string;
  id: string;
}

export default function usePriceIds(): priceIdInfo[] | undefined | null {
  const allChains = useAllChains();

  return useMemo(() => {
    const chainNameBaseIds = allChains.map(({ chain, genesisHash, isTestnet, tokenSymbol: symbol }) => {
      const id = sanitizeChainName(chain, true)?.toLowerCase();

      if (!id || !symbol || isTestnet) {
        return undefined;
      }

      return {
        genesisHash,
        id,
        symbol
      };
    }).filter((i) => !!i);

    const assetsInfoOfMultiAssetSelectedChains = chainNameBaseIds?.map(({ genesisHash, id }) =>
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

    const erc20PriceIds = erc20Assets.map(({ priceId, symbol }) => {
      if (!priceId) {
        return undefined;
      }

      return {
        id: priceId,
        symbol
      };
    }).filter((i) => !!i);

    const merged = [
      ...(chainNameBaseIds || []),
      ...(assetsInfoOfMultiAssetSelectedChains || []),
      ...erc20PriceIds
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
  }, [allChains]);
}
