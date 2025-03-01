// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import { ActionContext } from '@polkadot/extension-polkagate/src/components/contexts';

export default function ActionProvider({ children }: { children: React.ReactNode }) {
  const onAction = useCallback((to?: string): void => {
    if (to) {
      window.location.hash = to;
    }
  }, []);

  return (
    <ActionContext.Provider value={onAction}>
      {children}
    </ActionContext.Provider>
  );
}
