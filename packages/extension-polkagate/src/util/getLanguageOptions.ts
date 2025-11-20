// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

export interface LanguageOptions extends DropdownOption {
  flag?: string;
}

export function getLanguageOptions (): LanguageOptions[] {
  return [
    // default/native
    {
      flag: 'US',
      text: 'English',
      value: 'en'
    },
    {
      flag: 'CN',
      text: '汉语',
      value: 'zh'
    },
    {
      text: 'Français',
      value: 'fr'
    },
    {
      text: 'Русский',
      value: 'ru'
    },
    {
      flag: 'IN',
      text: 'हिन्दी',
      value: 'hi'
    },
    {
      text: 'Deutsch',
      value: 'de'
    },
    {
      text: 'español',
      value: 'es'
    }
  ];
}
