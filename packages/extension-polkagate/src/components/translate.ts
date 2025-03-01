// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { UseTranslationResponse } from 'react-i18next';

import { useTranslation as useTranslationBase, withTranslation } from 'react-i18next';

export function useTranslation(): UseTranslationResponse<string, undefined> {
  return useTranslationBase();
}

export default withTranslation();
