// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Prices } from '../util/types';

import { useContext } from 'react';

import { PricesContext } from '../components';

/**
 * @description
 * get all selected chains assets' prices and save in local storage
 * @returns null: means not savedPrice found, happens when the first account is created
 */
export default function usePrices(): Prices | undefined | null {
  const { prices } = useContext(PricesContext);

  return prices;
}
