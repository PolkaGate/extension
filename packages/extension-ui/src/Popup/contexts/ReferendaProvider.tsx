// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { LatestRefs } from '@polkadot/extension-polkagate/util/types';

import React, { useState } from 'react';

import { ReferendaContext } from '@polkadot/extension-polkagate/src/components/contexts';

export default function ReferendaProvider({ children }: { children: React.ReactNode }) {
  const [refs, setRefs] = useState<LatestRefs>({});

  return (
    <ReferendaContext.Provider value={{ refs, setRefs }}>
      {children}
    </ReferendaContext.Provider>
  );
}
