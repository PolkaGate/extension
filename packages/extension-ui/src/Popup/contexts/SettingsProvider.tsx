// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import React, { useEffect, useState } from 'react';

import { SettingsContext } from '@polkadot/extension-polkagate/src/components/contexts';
import uiSettings from '@polkadot/ui-settings';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export default function SettingsProvider({ children }: SettingsProviderProps) {
  const [settingsCtx, setSettingsCtx] = useState<SettingsStruct>(uiSettings.get());

  useEffect(() => {
    const settingsChange = (settings: SettingsStruct): void => {
      setSettingsCtx(settings);
    };

    uiSettings.on('change', settingsChange);
  }, []);

  return (
    <SettingsContext.Provider value={settingsCtx}>
      {children}
    </SettingsContext.Provider>
  );
}
