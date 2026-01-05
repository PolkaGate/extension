// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyIconTheme } from '@polkadot/extension-polkagate/util/types';

import React, { useEffect, useState } from 'react';

import { AccountIconThemeContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getAndWatchStorage } from '@polkadot/extension-polkagate/src/util';
import { DEFAULT_ACCOUNT_ICON_THEME, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

export default function AccountIconThemeProvider ({ children }: { children: React.ReactNode }) {
  const [accountIconTheme, setAccountIconTheme] = useState<MyIconTheme>(DEFAULT_ACCOUNT_ICON_THEME);

  useEffect(() => {
    const unsubscribe = getAndWatchStorage(STORAGE_KEY.ICON_THEME, setAccountIconTheme, false, DEFAULT_ACCOUNT_ICON_THEME);

    return () => unsubscribe();
  }, []);

  return (
    <AccountIconThemeContext.Provider value={{ accountIconTheme, setAccountIconTheme }}>
      {children}
    </AccountIconThemeContext.Provider>
  );
}
