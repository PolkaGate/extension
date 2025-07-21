// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LoginInfo } from '../popup/passwordManagement/types';

import { useEffect, useState } from 'react';

import { getStorage } from '../components/Loading';
import { NAMES_IN_STORAGE } from '../util/constants';

export default function useIsLoginEnabled (): boolean | undefined {
  const [isLoginEnabled, setIsLoginEnabled] = useState<boolean>();

  useEffect(() => {
    getStorage(NAMES_IN_STORAGE.LOGIN_IFO).then((info) => {
      setIsLoginEnabled((info as LoginInfo)?.status === 'set');
    }).catch(console.error);
  }, []);

  return isLoginEnabled;
}
