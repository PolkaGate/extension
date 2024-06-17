// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { useMemo } from 'react';

import { sanitizeChainName } from '../util/utils';
import { useInfo, usePrices } from '.';

export default function useNativeTokenPrice(address: string): number | undefined | null {
  const pricesInCurrency = usePrices();
  const { chainName } = useInfo(address);

  return useMemo((): number | undefined => {
    const currentChainName = sanitizeChainName(chainName)?.toLocaleLowerCase();
    const currentAssetPrices = pricesInCurrency?.prices?.[currentChainName as string];
    const mayBeTestNetPrice = pricesInCurrency?.prices && !currentAssetPrices ? 0 : undefined;

    return currentAssetPrices?.value || mayBeTestNetPrice;
  }, [chainName, pricesInCurrency?.prices]);
}
