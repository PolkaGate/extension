// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage, LoginInfo } from '../components/Loading';

export default function useIsLoginEnabled (): boolean | undefined {
  const [isLoginEnabled, setIsLoginEnabled] = useState<boolean>();

  useEffect(() => {
    getStorage('loginInfo').then((info) => {
      setIsLoginEnabled((info as LoginInfo)?.status === 'set');
    }).catch(console.error);
  }, []);

  return isLoginEnabled;
}
