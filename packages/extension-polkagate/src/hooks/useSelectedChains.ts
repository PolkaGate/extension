// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { getAndWatchStorage } from '../util';
import { STORAGE_KEY, TEST_NETS } from '../util/constants';
import { DEFAULT_SELECTED_CHAINS } from '../util/defaultSelectedChains';
import { useIsTestnetEnabled } from '.';

/**
 * @description get the selected chains
 * @returns a list of selected chains genesis hashes
 */
export default function useSelectedChains (): string[] | undefined {
  const isTestnetEnabled = useIsTestnetEnabled();

  const [selected, setSelected] = useState<string[] | undefined>();
  const defaultSelectedGenesisHashes = useMemo(() => DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string), []);

  useEffect(() => {
    const filteredDefault = isTestnetEnabled
      ? defaultSelectedGenesisHashes
      : defaultSelectedGenesisHashes.filter((genesis) => !TEST_NETS.includes(genesis));

    const unsubscribe = getAndWatchStorage(STORAGE_KEY.SELECTED_CHAINS, setSelected, false, filteredDefault);

    return () => unsubscribe();
  }, [defaultSelectedGenesisHashes, isTestnetEnabled, setSelected]);

  return selected;
}
