// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PricesType, PriceValue } from '../../../util/types';

import { useMemo } from 'react';

export function useTrendingAssets(prices: PricesType | undefined): PriceValue[] | undefined {
  return useMemo(() => {
    if (!prices) {
      return undefined;
    }

    const seen = new Set<string>();

    const sorted = Object.values(prices).sort((a, b) => (b.change ?? -Infinity) - (a.change ?? -Infinity));

    const dedupe = sorted.filter(({ symbol }) => {
      if (!symbol || seen.has(symbol)) {
        return false;
      }

      return seen.add(symbol);
    });

    return dedupe.map((i) => {
      if (!i.change) {
        i.change = 0;
      }

      return i;
    });
  }, [prices]);
}
