// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getFeeAssets, type TAssetInfo, type TChain, type TJunction, type TJunctions, type TLocation } from '@paraspell/sdk-pjs';
import { useMemo } from 'react';

import { normalizeChainName } from './utils';

/**
 * Normalizes a MultiLocation into a consistent format for fee payment logic.
 *
 * - If the MultiLocation represents a local asset (contains both PalletInstance and GeneralIndex):
 *   - Flattens `parents` from 1 → 0
 *   - Returns an interior with `X2` containing exactly the PalletInstance and GeneralIndex
 *
 * - If the MultiLocation represents a foreign/cross-chain asset:
 *   - Leaves `parents` unchanged
 *   - Returns an interior with `X2` containing only the first two relevant entries (e.g. Parachain + PalletInstance)
 *
 * @param location - The original MultiLocation object to normalize
 * @returns The normalized MultiLocation with a consistent `X2` structure
 */
function normalizeMultiLocation (location: TLocation): TLocation {
  let { interior, parents } = location;

  const keys = Object.keys({} as TJunctions).filter((k) => k !== 'Here') as (keyof TJunctions)[];

  // Find the actual Xn array
  let currentEntries: TJunction[] = [];

  if (interior !== 'Here') {
    for (const key of keys) {
      const raw = interior?.[key];
      const entries: TJunction[] = Array.isArray(raw) ? raw : [];

      if (entries.length) {
        currentEntries = entries;
        break; // Only one Xn exists
      }
    }
  }

  // Check if local asset
  const hasLocal =
    currentEntries.some((e) => 'PalletInstance' in e) &&
    currentEntries.some((e) => 'GeneralIndex' in e);

  // Flatten parents only for local assets
  if (hasLocal && parents === 1) {
    parents = 0;
  }

  // Build X2 with exactly two relevant entries
  const x2: TJunction[] = [];

  if (hasLocal) {
    for (const e of currentEntries) {
      if ('PalletInstance' in e || 'GeneralIndex' in e) {
        x2.push(e);
      }
    }
  } else if (currentEntries.length) {
    // foreign/cross-chain assets: take first two entries
    x2.push(currentEntries[0]);

    if (currentEntries[1]) {
      x2.push(currentEntries[1]);
    }
  }

  return {
    interior: {
      X2: x2
    },
    parents
  };
}

export default function usePayWithAsset (chainName: string | undefined): Omit<TAssetInfo, 'isFeeAsset'>[] | undefined {
  return useMemo(() => {
    if (!chainName) {
      return;
    }

    const normalizedChainName = normalizeChainName(chainName) as TChain;

    const feeAssets = getFeeAssets(normalizedChainName);

    const normalizedFeeAssets = feeAssets.map((a) => ({
      ...a,
      location: a.location ? normalizeMultiLocation(a.location) : a.location
    }));

    return normalizedFeeAssets;
  }, [chainName]);
}
