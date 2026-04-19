// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { NetworkInfo } from '@polkadot/extension-polkagate/src/util/chains';
import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Prices } from '../../util/types';

import { calcPrice, sanitizeChainName, toTitleCase } from '@polkadot/extension-polkagate/src/util';

import resolveLogoInfo, { type LogoInfo } from '../../util/logo/resolveLogoInfo';

export interface AssetDetailType {
  assets: (FetchedBalance & { totalPrice: number })[];
  chainTotalBalance: number;
  chainName: string | undefined;
  genesisHash: string;
  logoInfo: LogoInfo | undefined;
  token?: string | undefined;
}

export function buildChainsAssetsSummary(
  chains: NetworkInfo[],
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
    const fallbackAsset = enrichedBalances.find(({ isNative }) => isNative) ?? enrichedBalances[0];
    const sortedAssets = enrichedBalances.sort((a, b) => b.totalPrice - a.totalPrice);

    const network = chains.find(({ genesisHash: networkGenesisHash }) => genesisHash === networkGenesisHash);
    const token = network?.tokenSymbol ?? fallbackAsset?.token;
    const logoInfo = resolveLogoInfo(genesisHash);
    const chainName = toTitleCase(sanitizeChainName(network?.name ?? fallbackAsset?.chainName, true));

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
