// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import React, { useEffect, useState } from 'react';

import { AccountIconThemeContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getStorage, watchStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { DEFAULT_ACCOUNT_ICON_THEME } from '@polkadot/extension-polkagate/src/util/constants';

export default function AccountIconThemeProvider({ children }: { children: React.ReactNode }) {
  const [accountIconTheme, setAccountIconTheme] = useState<IconTheme>(DEFAULT_ACCOUNT_ICON_THEME);

  useEffect(() => {
    getStorage('iconTheme')
      .then((maybeTheme) => setAccountIconTheme((maybeTheme as IconTheme | undefined) || DEFAULT_ACCOUNT_ICON_THEME))
      .catch(console.error);

    const unsubscribe = watchStorage('iconTheme', setAccountIconTheme);

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
