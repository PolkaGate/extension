// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '../../hooks/useAssetsBalances';
import type { Prices } from '../../util/types';

import chains from '@polkadot/extension-polkagate/src/util/chains';

import { calcPrice } from '../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../util/getLogo2';

export interface AssetDetailType {
  assets: (FetchedBalance & { totalPrice: number })[];
  chainTotalBalance: number;
  chainName: string | undefined;
  genesisHash: string;
  logoInfo: LogoInfo | undefined;
  token?: string | undefined;
}

export function buildChainsAssetsSummary (
  assets: Record<string, FetchedBalance[]> | null | undefined,
  pricesInCurrency: Prices
): AssetDetailType[] | null | undefined {
  if (!assets) {
    return assets;
  }

  return Object.entries(assets).map(([genesisHash, balances]) => {
    const enrichedBalances = balances.map((b) => ({
      ...b,
      totalPrice: calcPrice(pricesInCurrency?.prices?.[b.priceId]?.value || 0, b.totalBalance, b.decimal)
    }));

    const chainTotalBalance = enrichedBalances.reduce((sum, b) => sum + b.totalPrice, 0);
    const sortedAssets = enrichedBalances.sort((a, b) => b.totalPrice - a.totalPrice);

    const network = chains.find(({ genesisHash: networkGenesisHash, tokenSymbol }) => genesisHash === networkGenesisHash && tokenSymbol);
    const token = network?.tokenSymbol;
    const logoInfo = getLogo2(genesisHash);
    const chainName = network?.name;

    return {
      assets: sortedAssets,
      chainName,
      chainTotalBalance,
      genesisHash,
      logoInfo,
      token
    };
  })
    .sort((a, b) => b.chainTotalBalance - a.chainTotalBalance);
}
