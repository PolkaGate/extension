// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from './types';

export default function getLanguageOptions(): DropdownOption[] {
  return [
    // default/native
    {
      text: 'English',
      value: 'en'
    },
    {
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
      text: 'हिन्दी',
      value: 'hi'
    },
    {
      text: 'español',
      value: 'es'
    }
  ];
}
