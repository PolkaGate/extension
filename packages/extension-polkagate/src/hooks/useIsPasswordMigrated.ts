// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';

export default function useIsPasswordMigrated (): boolean | undefined {
  const [isMigrated, setMigrated] = useState<boolean>();

  useEffect(() => {
    getStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED)
      .then((res) => setMigrated(!!res))
      .catch(console.error);
  }, []);

  return isMigrated;
}
