// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UserAddedChains } from '@polkadot/extension-polkagate/util/types';

import React, { useEffect, useState } from 'react';

import { UserAddedChainContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage } from '@polkadot/extension-polkagate/src/components/Loading';

export default function UserAddedChainsProvider({ children }: { children: React.ReactNode }) {
  const [userAddedChainCtx, setUserAddedChainCtx] = useState<UserAddedChains>({});

  useEffect((): void => {
    getStorage('userAddedEndpoint').then((info) => {
      info && setUserAddedChainCtx(info as UserAddedChains);
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserAddedChainContext.Provider value={userAddedChainCtx}>
      {children}
    </UserAddedChainContext.Provider>
  );
}
