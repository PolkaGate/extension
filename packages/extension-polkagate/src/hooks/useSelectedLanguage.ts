// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useEffect, useState } from 'react';

import uiSetting from '@polkadot/ui-settings';

import { SettingsContext } from '../components';

export default function useSelectedLanguage (): string {
  const settings = useContext(SettingsContext);

  const [languageTicker, setLanguage] = useState('EN');

  useEffect(() => {
    setLanguage(settings.i18nLang === 'default' ? 'En' : settings.i18nLang);

    uiSetting.on('change', (newSettings) => {
      setLanguage(newSettings.i18nLang);
    });
  }, [settings]);

  return languageTicker;
}
