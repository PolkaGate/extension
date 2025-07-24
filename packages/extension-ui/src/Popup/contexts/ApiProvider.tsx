// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { APIs } from '@polkadot/extension-polkagate/util/types';

import React, { useState } from 'react';

import { APIContext } from '@polkadot/extension-polkagate/src/components/contexts';

export default function ApiProvider({ children }: { children: React.ReactNode }) {
  const [apis, setApis] = useState<APIs>({});

  const updateApis = React.useCallback((change: APIs) => {
    setApis(change);
  }, []);

  return (
    <APIContext.Provider value={{ apis, setIt: updateApis }}>
      {children}
    </APIContext.Provider>
  );
}
