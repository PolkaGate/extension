// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useMemo } from 'react';

import { sanitizeChainName } from '../util/utils';
import { useInfo, usePrices } from '.';

export default function useNativeTokenPrice(address: string): number | undefined | null {
  const pricesInCurrency = usePrices();
  const { chainName } = useInfo(address);

  return useMemo((): number | undefined => {
    if (!chainName) {
      return undefined;
    }

    const currentChainName = sanitizeChainName(chainName)?.toLocaleLowerCase();

    if (!currentChainName) {
      return undefined;
    }

    const currentAssetPrices = pricesInCurrency?.prices?.[currentChainName];
    const maybeTestNetPrice = pricesInCurrency?.prices && !currentAssetPrices ? 0 : undefined;

    return currentAssetPrices?.value || maybeTestNetPrice;
  }, [chainName, pricesInCurrency?.prices]);
}
