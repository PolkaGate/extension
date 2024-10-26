// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useChain, useTranslation } from '.';

export default function useHasIdentityTooltipText (address: string | undefined, hasID: boolean | undefined): string {
  const { t } = useTranslation();

  const chain = useChain(address);
  const anyChainModeText = t('Account is in Any Chain mode');

  return useMemo(() => {
    if (!chain) {
      return anyChainModeText;
    }

    switch (hasID) {
      case true:
        return t('Has identity');
      case false:
        return t('No identity');
      default:
        return t('Checking');
    }
  }, [anyChainModeText, chain, hasID, t]);
}
