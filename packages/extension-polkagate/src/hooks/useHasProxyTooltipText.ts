// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useChain, useTranslation } from '.';

export default function useHasProxyTooltipText (address: string | undefined, hasProxy: boolean | undefined): string {
  const { t } = useTranslation();

  const chain = useChain(address);
  const anyChainModeText = t('Account is in Any Chain mode');

  return useMemo(() => {
    if (!chain) {
      return anyChainModeText;
    }

    switch (hasProxy) {
      case true:
        return t('Has proxy');
      case false:
        return t('No proxy');
      default:
        return t('Checking');
    }
  }, [anyChainModeText, chain, hasProxy, t]);
}
