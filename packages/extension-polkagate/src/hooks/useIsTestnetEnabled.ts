// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage } from '../components/Loading';

export default function useIsTestnetEnabled (): boolean | undefined {
  const [isTestnetEnabled, setTestnetIsEnabled] = useState<boolean>();

  useEffect(() => {
    let isMounted = true;

    getStorage('testnet_enabled')
      .then((res) => {
        if (isMounted) {
          setTestnetIsEnabled(!!res);
        }
      })
      .catch(console.error);

    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'local' && 'testnet_enabled' in changes) {
        const newValue = !!changes['testnet_enabled'].newValue;

        setTestnetIsEnabled((prev) => prev !== newValue ? newValue : prev);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      isMounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return isTestnetEnabled;
}
