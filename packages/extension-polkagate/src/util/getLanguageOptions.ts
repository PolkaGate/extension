// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

interface Option {
  info?: string;
  isDisabled?: boolean;
  isHeader?: boolean;
  text: React.ReactNode;
  value: string | number;
}

export default function getLanguageOptions(): Option[] {
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
    }
  ];
}
