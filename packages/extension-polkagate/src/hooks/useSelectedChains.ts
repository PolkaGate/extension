// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';
import { DEFAULT_SELECTED_CHAINS } from '../util/defaultSelectedChains';

/**
 * @description get the selected chains
 * @returns a list of selected chains genesis hashes
 */
export default function useSelectedChains(): string[] | undefined {
  const [selected, setSelected] = useState<string[] | undefined>();
  const defaultSelectedGenesisHashes = useMemo(() => DEFAULT_SELECTED_CHAINS.map(({ value }) => value as string), []);

  useEffect(() => {
    getStorage('selectedChains').then((res) => {
      setSelected(res as string[] || defaultSelectedGenesisHashes);
    }).catch(console.error);

    const unsubscribe = watchStorage('selectedChains', setSelected);

    return () => {
      unsubscribe();
    };
  }, [defaultSelectedGenesisHashes, setSelected]);

  return selected;
}
