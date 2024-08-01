// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useEffect, useState } from 'react';

import { getStorage } from '../components/Loading';

export default function useIsTestnetEnabled(): boolean | undefined {
  const [isTestnetEnabled, setTestnetIsEnabled] = useState<boolean>();

  useEffect(() => {
    getStorage('testnet_enabled').then((res) => {
      setTestnetIsEnabled(!!res);
    }).catch(console.error);

    browser.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName === 'local' && 'testnet_enabled' in changes) {
        const newValue = changes.testnet_enabled.newValue as boolean;

        setTestnetIsEnabled(!!newValue);
      }
    });
  }, []);

  return isTestnetEnabled;
}
