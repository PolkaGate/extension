// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';

import { type BN, BN_ZERO } from '@polkadot/util';

import { AccountsAssetsContext } from '../components';
import { getValue } from '../popup/account/util';
import { amountToHuman } from '../util/utils';
import { usePrices } from '.';

export interface YouHaveType {
  available: number;
  change: number;
  date: number;
  portfolio: number;
}

export const calcPrice = (assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0);

export const calcChange = (tokenPrice: number, tokenBalance: number, tokenPriceChange: number) => {
  if (tokenPriceChange === -100) {
    return 0;
  }

  const totalChange = (tokenPriceChange * tokenBalance) / 100;

  return totalChange * tokenPrice;
};

/**
 * @description
 *  returns all user portfolio balance in selected currency
 * @returns null: means not balance found, undefined: when still work in progress, and number indicating user balance in selected currency
 */
export default function useYouHave (): YouHaveType | undefined | null {
  const pricesInCurrencies = usePrices();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const youHave = useMemo(() => {
    if (!accountsAssets?.balances) {
      return null;
    }

    if (!pricesInCurrencies) {
      return undefined;
    }

    let portfolio = 0;
    let available = 0;
    let change = 0;
    const balances = accountsAssets.balances;
    const date = Math.min(accountsAssets.timeStamp, pricesInCurrencies.date);

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        balances?.[address]?.[genesisHash].forEach((asset) => {
          const tokenValue = pricesInCurrencies.prices[asset.priceId]?.value ?? 0;
          const tokenPriceChange = pricesInCurrencies.prices[asset.priceId]?.change ?? 0;
          const currentAssetPrice = calcPrice(tokenValue, asset.totalBalance, asset.decimal);
          //@ts-ignore
          const transferable = getValue('transferable', asset);

          const currentAvailableAssetPrice = calcPrice(tokenValue, transferable ?? BN_ZERO, asset.decimal);

          portfolio += currentAssetPrice;
          available += currentAvailableAssetPrice;
          change += calcChange(tokenValue, Number(asset.totalBalance) / (10 ** asset.decimal), tokenPriceChange);
        });
      });
    });

    return { available, change, date, portfolio } as unknown as YouHaveType;
  }, [accountsAssets, pricesInCurrencies]);

  return youHave;
}
