// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

export interface LanguageOptions extends DropdownOption {
  flag?: string;
}

export function getLanguageOptions(): LanguageOptions[] {
  return [
    // default/native
    {
      text: 'Deutsch',
      value: 'de'
    },
    {
      flag: 'US',
      text: 'English',
      value: 'en'
    },
    {
      text: 'español',
      value: 'es'
    },
    {
      text: 'Français',
      value: 'fr'
    },
    {
      flag: 'CN',
      text: '汉语',
      value: 'zh'
    },
    {
      flag: 'IN',
      text: 'हिन्दी',
      value: 'hi'
    },
    {
      flag: 'BR',
      text: 'Português',
      value: 'pt'
    },
    {
      text: 'Русский',
      value: 'ru'
    }
  ];
}
