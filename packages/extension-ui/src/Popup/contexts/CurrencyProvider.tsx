// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CurrencyItemType } from '@polkadot/extension-polkagate/fullscreen/home/partials/type';

import React, { useEffect, useState } from 'react';

import { CurrencyContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getAndWatchStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { USD_CURRENCY } from '@polkadot/extension-polkagate/src/util/currencyList';

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export default function CurrencyProvider ({ children }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<CurrencyItemType>();

  useEffect(() => {
    const unsubscribe = getAndWatchStorage(STORAGE_KEY.CURRENCY, setCurrency, false, USD_CURRENCY);

    return () => unsubscribe();
  }, [setCurrency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
