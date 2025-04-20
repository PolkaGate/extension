// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { type BN, BN_ZERO } from '@polkadot/util';

import { AccountsAssetsContext } from '../components';
import { getValue } from '../popup/account/util';
import { amountToHuman } from '../util/utils';
import { usePrices } from '.';

export interface PortfolioType {
  available: number;
  change: number;
  date: number;
  portfolio: number;
}

const calcPrice = (assetPrice: number | undefined, balance: BN, decimal: number) =>
  parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0);

const calcChange = (tokenPrice: number, tokenBalance: number, tokenPriceChange: number) => {
  if (tokenPriceChange === -100) {
    return 0;
  }

  const totalChange = (tokenPriceChange * tokenBalance) / 100;

  return totalChange * tokenPrice;
};

/**
 * @description
 *  Returns portfolio data for a given address, or for all accounts if no address is provided
 * @param address Optional address to fetch portfolio for a single account
 * @returns null: no data found, undefined: still loading, PortfolioType: the portfolio info
 */
export default function usePortfolio (address?: string): PortfolioType | undefined | null {
  const pricesInCurrencies = usePrices();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const portfolioData = useMemo(() => {
    if (!accountsAssets?.balances) {
      return null;
    }

    if (!pricesInCurrencies) {
      return undefined;
    }

    const targetAddresses = address
      ? [address]
      : Object.keys(accountsAssets.balances);

    if (targetAddresses.length === 0) {
      return null;
    }

    let portfolio = 0;
    let available = 0;
    let change = 0;
    const date = Math.min(accountsAssets.timeStamp, pricesInCurrencies.date);

    for (const addr of targetAddresses) {
      const perChainAssets = accountsAssets.balances[addr];

      if (!perChainAssets) {
        continue;
      }

      Object.values(perChainAssets).forEach((assets) => {
        assets.forEach((asset) => {
          const tokenValue = pricesInCurrencies.prices[asset.priceId]?.value ?? 0;
          const tokenPriceChange = pricesInCurrencies.prices[asset.priceId]?.change ?? 0;

          const currentAssetPrice = calcPrice(tokenValue, asset.totalBalance, asset.decimal);
          const transferable = getValue('transferable', asset);
          const currentAvailableAssetPrice = calcPrice(tokenValue, transferable ?? BN_ZERO, asset.decimal);

          portfolio += currentAssetPrice;
          available += currentAvailableAssetPrice;
          change += calcChange(
            tokenValue,
            Number(asset.totalBalance) / 10 ** asset.decimal,
            tokenPriceChange
          );
        });
      });
    }

    return { available, change, date, portfolio };
  }, [address, accountsAssets, pricesInCurrencies]);

  return portfolioData;
}
