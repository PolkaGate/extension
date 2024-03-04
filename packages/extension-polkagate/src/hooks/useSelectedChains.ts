// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage } from '../components/Loading';

/**
 * @description get the selected chains
 * @returns a list of selected chains genesis hashes
 */
export default function useSelectedChains (): string[] | undefined {
  const [selected, setSelected] = useState<string[] | undefined>();

  useEffect(() => {
    getStorage('selectedChains').then((res) => {
      setSelected(res as string[]);
    }).catch(console.error);

    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName === 'local' && 'selectedChains' in changes) {
        const newValue = changes.selectedChains.newValue as string[];

        setSelected(newValue as unknown as string[]);
      }
    });
  }, [setSelected]);

  return selected;
}
