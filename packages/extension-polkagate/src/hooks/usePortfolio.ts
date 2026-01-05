// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { AccountsAssetsContext } from '../components';
import { calcChange, calcPrice } from '../util';
import usePrices from './usePrices';

export interface PortfolioType {
  available: number;
  change: number;
  date: number;
  portfolio: number;
}

/**
 * @description
 *  Returns portfolio data for a given address, or for all accounts if no address is provided
 * @param address Optional address to fetch portfolio for a single account
 * @returns null: no data found, undefined: still loading, PortfolioType: the portfolio info
 */
export default function usePortfolio (address?: string): PortfolioType | undefined | null {
  const pricesInCurrencies = usePrices();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  return useMemo(() => {
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
    let change = 0;
    const date = Math.min(accountsAssets.timeStamp, pricesInCurrencies.date);

    for (const addr of targetAddresses) {
      const perChainAssets = accountsAssets.balances[addr];

      if (!perChainAssets) {
        continue;
      }

      for (const assets of Object.values(perChainAssets)) {
        for (const asset of assets) {
          const { decimal, priceId, totalBalance } = asset;
          const tokenData = pricesInCurrencies.prices[priceId];

          if (!tokenData) {
            continue;
          }

          const { change: tokenPriceChange = 0, value: tokenValue = 0 } = tokenData;

          const currentAssetPrice = calcPrice(tokenValue, totalBalance, decimal);
          const tokenBalanceNum = Number(totalBalance) / 10 ** decimal;

          portfolio += currentAssetPrice;
          change += calcChange(tokenValue, tokenBalanceNum, tokenPriceChange);
        }
      }
    }

    return { available: 0, change, date, portfolio };
  }, [address, accountsAssets, pricesInCurrencies]);
}
