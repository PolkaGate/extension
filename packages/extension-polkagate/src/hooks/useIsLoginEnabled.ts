// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LoginInfo } from '../popup/passwordManagement/types';

import { useEffect, useState } from 'react';

import { getStorage } from '../components/Loading';
import { STORAGE_KEY } from '../util/constants';

export default function useIsLoginEnabled (): boolean | undefined {
  const [isLoginEnabled, setIsLoginEnabled] = useState<boolean>();

  useEffect(() => {
    getStorage(STORAGE_KEY.LOGIN_INFO).then((info) => {
      setIsLoginEnabled((info as LoginInfo)?.status === 'set');
    }).catch(console.error);
  }, []);

  return isLoginEnabled;
}
