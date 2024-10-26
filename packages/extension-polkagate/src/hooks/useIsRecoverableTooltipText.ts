// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useChain, useTranslation } from '.';

export default function useIsRecoverableTooltipText (address: string | undefined, isRecoverable: boolean | undefined): string {
  const { t } = useTranslation();

  const chain = useChain(address);
  const anyChinModeText = t('Account is in Any Chain mode');

  return useMemo(() => {
    if (!chain) {
      return anyChinModeText;
    }

    switch (isRecoverable) {
      case true:
        return t('Recoverable');
      case false:
        return t('Not recoverable');
      default:
        return t('Checking');
    }
  }, [anyChinModeText, chain, isRecoverable, t]);
}
