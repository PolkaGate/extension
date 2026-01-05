// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getAndWatchStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';

export default function useIsTestnetEnabled (): boolean | undefined {
  const [isTestnetEnabled, setTestnetIsEnabled] = useState<boolean>();

  useEffect(() => {
    getAndWatchStorage(
      STORAGE_KEY.TEST_NET_ENABLED,
      setTestnetIsEnabled,
      false,
      false
    );
  }, []);

  return isTestnetEnabled;
}
