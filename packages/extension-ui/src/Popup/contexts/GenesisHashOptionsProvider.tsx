// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { GenesisHashOptionsContext } from '@polkadot/extension-polkagate/src/components/contexts';
import useGenesisHashOptions from '@polkadot/extension-polkagate/src/hooks/useGenesisHashOptions';

export default function GenesisHashOptionsProvider({ children }: { children: React.ReactNode }) {
  const genesisHashOptionsCtx = useGenesisHashOptions();

  return (
    <GenesisHashOptionsContext.Provider value={genesisHashOptionsCtx}>
      {children}
    </GenesisHashOptionsContext.Provider>
  );
}
