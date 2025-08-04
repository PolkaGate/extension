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

  const maxPosition = useMemo(() => {
    if (!positions?.length || !pricesInCurrency || !withMax) {
      return undefined;
    }

    const { prices } = pricesInCurrency;

    return positions.reduce((max, current) => {
      const { value: priceValue1 = 0 } = prices[max.priceId] ?? {};

      const maxValue = max.soloTotal?.gt(max.pooledBalance || BN_ZERO)
        ? max.soloTotal
        : max.pooledBalance;

      const maxValueInCurrency = parseFloat(amountToHuman(maxValue, max.decimal)) * (priceValue1 ?? 0);

      const { value: priceValue2 = 0 } = prices[current.priceId] ?? {};
      const currentValue = current.soloTotal?.gt(current.pooledBalance || BN_ZERO)
        ? current.soloTotal
        : current.pooledBalance;

      const currentValueInCurrency = parseFloat(amountToHuman(currentValue, current.decimal)) * (priceValue2 ?? 0);

      return currentValueInCurrency > maxValueInCurrency ? current : max;
    });
  }, [positions, pricesInCurrency, withMax]);

  const maxPositionType = useMemo(() => {
    if (!maxPosition || !pricesInCurrency) {
      return undefined;
    }

    const { prices } = pricesInCurrency;

    const { value: priceValue1 = 0 } = prices[maxPosition.priceId] ?? {};

    const maxSoloInCurrency = parseFloat(amountToHuman(maxPosition.soloTotal, maxPosition.decimal)) * (priceValue1 ?? 0);
    const maxPoolInCurrency = parseFloat(amountToHuman(maxPosition.pooledBalance, maxPosition.decimal)) * (priceValue1 ?? 0);

    return maxSoloInCurrency > maxPoolInCurrency ? 'solo' : 'pool';
  }, [maxPosition, pricesInCurrency]);

  return { maxPosition, maxPositionType, positions };
}
