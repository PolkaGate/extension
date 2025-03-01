// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Fetching } from '@polkadot/extension-polkagate/util/types';

import React, { useCallback, useState } from 'react';

import { FetchingContext } from '@polkadot/extension-polkagate/src/components/contexts';

export default function FetchingProvider({ children }: { children: React.ReactNode }) {
  const [fetching, setFetching] = useState<Fetching>({});

  const set = useCallback((change: Fetching) => {
    setFetching(change);
  }, []);

  return (
    <FetchingContext.Provider value={{ fetching, set }}>
      {children}
    </FetchingContext.Provider>
  );
}
