// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '../util/types';

import { useMemo } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { amountToHuman } from '../util';
import useAccountAssets from './useAccountAssets';
import usePrices from './usePrices';

export default function useStakingPositions(address: string | undefined, active?: boolean): { positions: FetchedBalance[] | undefined | null, maxPosition: FetchedBalance | undefined, maxPositionType: 'solo' | 'pool' | undefined } {
  const accountAssets = useAccountAssets(address);
  const pricesInCurrency = usePrices();

  const positions = useMemo(() =>
    accountAssets?.filter(({ pooledBalance, soloTotal }) => (soloTotal && !soloTotal.isZero()) || (pooledBalance && !pooledBalance.isZero()))
    , [accountAssets]);

  const { maxPosition, maxPositionType } = useMemo(() => {
    if (!positions?.length || !pricesInCurrency || !active) {
      return {
        maxPosition: undefined,
        maxPositionType: undefined
      };
    }

    const { prices } = pricesInCurrency;

    const initMax = {
      position: {} as FetchedBalance,
      valueInCurrency: -1
    };

    const foundMax = positions.slice().reduce((max, current) => {
      const { value: price = 0 } = prices[current.priceId] ?? {};
      const currentValue = current.soloTotal?.gt(current.pooledBalance || BN_ZERO)
        ? current.soloTotal
        : current.pooledBalance;

      const valueInCurrency = parseFloat(amountToHuman(currentValue, current.decimal)) * (price ?? 0);

      return valueInCurrency > max.valueInCurrency
        ? {
          position: current,
          valueInCurrency
        }
        : max;
    }, initMax);

    const type = (foundMax.position.soloTotal || BN_ZERO).gt((foundMax.position.pooledBalance || BN_ZERO))
      ? 'solo'
      : 'pool';

    return {
      maxPosition: foundMax.position,
      maxPositionType: type as 'solo' | 'pool'
    };
  }, [positions, pricesInCurrency, active]);

  return { maxPosition, maxPositionType, positions };
}
