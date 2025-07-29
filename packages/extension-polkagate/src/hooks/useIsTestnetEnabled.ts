// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getAndWatchStorage } from '../util';
import { NAMES_IN_STORAGE } from '../util/constants';

export default function useIsTestnetEnabled (): boolean | undefined {
  const [isTestnetEnabled, setTestnetIsEnabled] = useState<boolean>();

  useEffect(() => {
    getAndWatchStorage(
      NAMES_IN_STORAGE.TEST_NET_ENABLED,
      setTestnetIsEnabled
    );
  }, []);

  return isTestnetEnabled;
}
