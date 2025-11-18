// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import React, { useEffect, useState } from 'react';

import { SettingsContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { getLanguageOptions } from '@polkadot/extension-polkagate/src/util/getLanguageOptions';
import uiSettings from '@polkadot/ui-settings';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export default function SettingsProvider ({ children }: SettingsProviderProps) {
  const [settingsCtx, setSettingsCtx] = useState<SettingsStruct>(uiSettings.get());

  useEffect(() => {
    const settingsChange = (settings: SettingsStruct): void => {
      setSettingsCtx(settings);
    };

    uiSettings.on('change', settingsChange);
  }, []);

  useEffect(() => {
    if (settingsCtx.i18nLang === 'default') {
      const i18nLang = chrome.i18n.getUILanguage().split('-')[0];
      const isSupported = getLanguageOptions().find(({ value }) => value === i18nLang);

      isSupported && uiSettings.set({ i18nLang });
      console.log('PolkaGate default language is set to ', i18nLang);
    }
  }, [settingsCtx.i18nLang]);

  return (
    <SettingsContext.Provider value={settingsCtx}>
      {children}
    </SettingsContext.Provider>
  );
}
