// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import uiSettings from '@polkadot/ui-settings';

export default function useSelectedLanguage (): string {
  const settings = uiSettings.get();

  return useMemo(
    () =>
      settings.i18nLang === 'default' ? 'En' : settings.i18nLang
    ,
    [settings]);
}
