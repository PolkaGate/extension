// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MyIconTheme } from '@polkadot/extension-polkagate/util/types';

import React, { useEffect, useState } from 'react';

import { AccountIconThemeContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage, watchStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { DEFAULT_ACCOUNT_ICON_THEME, ICON_THEME_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

export default function AccountIconThemeProvider ({ children }: { children: React.ReactNode }) {
  const [accountIconTheme, setAccountIconTheme] = useState<MyIconTheme>(DEFAULT_ACCOUNT_ICON_THEME);

  useEffect(() => {
    getStorage(ICON_THEME_NAME_IN_STORAGE)
      .then((maybeTheme) => setAccountIconTheme((maybeTheme as MyIconTheme | undefined) || DEFAULT_ACCOUNT_ICON_THEME))
      .catch(console.error);

    const unsubscribe = watchStorage(ICON_THEME_NAME_IN_STORAGE, setAccountIconTheme);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AccountIconThemeContext.Provider value={{ accountIconTheme, setAccountIconTheme }}>
      {children}
    </AccountIconThemeContext.Provider>
  );
}
