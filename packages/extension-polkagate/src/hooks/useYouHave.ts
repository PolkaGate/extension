// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { AccountsAssetsContext } from '../components';
import { amountToHuman } from '../util/utils';
import { usePrices3 } from '.';

/**
 * @description
 *  returns all user portfolio balance in selected currency
 * @returns null: means not balance found, undefined: when still work in progress, and number indicating user balance in selected currency
 */
export default function useYouHave (): number | undefined | null {
  const pricesInCurrencies = usePrices3();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const calPrice = useCallback((assetPrice: number | undefined, balance: BN, decimal: number) => parseFloat(amountToHuman(balance, decimal)) * (assetPrice ?? 0), []);

  const youHave = useMemo(() => {
    if (!accountsAssets?.balances || !pricesInCurrencies) {
      return undefined;
    }

    let totalPrice = 0;
    const balances = accountsAssets.balances;

    Object.keys(balances).forEach((address) => {
      Object.keys(balances?.[address]).forEach((genesisHash) => {
        balances?.[address]?.[genesisHash].forEach((asset) => {
          totalPrice += calPrice(pricesInCurrencies.prices[asset.priceId]?.value ?? 0, asset.totalBalance, asset.decimal);
        });
      });
    });

    return totalPrice;
  }, [accountsAssets, calPrice, pricesInCurrencies]);

  return youHave;
}
