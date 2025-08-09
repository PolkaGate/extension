// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '../util/types';

import { useMemo } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { amountToHuman } from '../util/numberUtils';
import { useAccountAssets, usePrices } from '.';

export default function useStakingPositions (address: string | undefined, withMax?: boolean): { positions: FetchedBalance[] | undefined | null, maxPosition: FetchedBalance | undefined, maxPositionType: 'solo' | 'pool' | undefined } {
  const accountAssets = useAccountAssets(address);
  const pricesInCurrency = usePrices();

  const positions = useMemo(() =>
    accountAssets?.filter(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero()))
  , [accountAssets]);

  const { maxPosition, maxPositionType } = useMemo(() => {
    if (!positions?.length || !pricesInCurrency || !withMax) {
      return {
        maxPosition: undefined,
        maxPositionType: undefined
      };
    }

    const { prices } = pricesInCurrency;

    const initMax = {
      position: {} as FetchedBalance,
      valueInCurrency: 0
    };

    const foundedMax = positions.slice().reduce((max, current) => {
      const { value: price = 0 } = prices[current.priceId] ?? {};
      const currentValue = current.soloTotal?.gt(current.pooledBalance || BN_ZERO)
        ? current.soloTotal
        : current.pooledBalance;

      const currentValueInCurrency = parseFloat(amountToHuman(currentValue, current.decimal)) * (price ?? 0);

      return currentValueInCurrency > max.valueInCurrency
        ? {
          position: current,
          valueInCurrency: currentValueInCurrency
        }
        : max;
    }, initMax);

    const type = (foundedMax.position.soloTotal || BN_ZERO).gt((foundedMax.position.pooledBalance || BN_ZERO))
      ? 'solo'
      : 'pool';

    return {
      maxPosition: foundedMax.position,
      maxPositionType: type as 'solo' | 'pool'
    };
  }, [positions, pricesInCurrency, withMax]);

  return { maxPosition, maxPositionType, positions };
}
