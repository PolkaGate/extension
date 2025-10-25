// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../util';
import { AUTO_LOCK_PERIOD_DEFAULT, STORAGE_KEY } from '../util/constants';

export type AutoLockDelayType = 'min' | 'hour' | 'day';

export interface AutoLock {
  enabled: boolean;
  delay: {
    value: number;
    type: AutoLockDelayType;
  }
}

const DEFAULT_AUTO_LOCK: AutoLock = {
  delay: {
    type: 'min',
    value: AUTO_LOCK_PERIOD_DEFAULT
  },
  enabled: false
};

export default function useAutoLock (): AutoLock | undefined {
  const [autoLock, setAutoLock] = useState<AutoLock>();

  useEffect(() => {
    getStorage(STORAGE_KEY.AUTO_LOCK).then((res) => {
      setAutoLock(res as AutoLock | undefined ?? DEFAULT_AUTO_LOCK);
    }).catch(console.error);

    watchStorage(STORAGE_KEY.AUTO_LOCK, setAutoLock);
  }, []);

  return autoLock;
}
