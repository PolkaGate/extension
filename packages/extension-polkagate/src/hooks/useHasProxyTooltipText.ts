// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useInfo, useProxies, useTranslation } from '.';

export default function useHasProxyTooltipText(address: string | undefined): { hasProxy: boolean | undefined; proxyTooltipTxt: string; } {
  const { t } = useTranslation();

  const { api, chain, formatted } = useInfo(address);

  const proxies = useProxies(api, formatted);
  const hasProxy = proxies ? !!proxies.length : undefined;

  const proxyTooltipTxt = useMemo(() => {
    if (!chain) {
      return t('Account is in Any Chain mode');
    }

    switch (hasProxy) {
      case true:
        return t('Has proxy');
      case false:
        return t('No proxy');
      default:
        return t('Checking');
    }
  }, [chain, hasProxy, t]);

  return {
    hasProxy,
    proxyTooltipTxt
  };
}
