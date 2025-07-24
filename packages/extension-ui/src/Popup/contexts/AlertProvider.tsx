// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AlertType } from '@polkadot/extension-polkagate/util/types';

import React, { useState } from 'react';

import { AlertContext } from '@polkadot/extension-polkagate/src/components/contexts';

export default function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
}
