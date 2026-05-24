// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';

import useAlerts from './useAlerts';
import useTranslation from './useTranslation';

export default function useTransactionStatus() {
  const { t } = useTranslation();
  const { notify } = useAlerts();

  const handleTxEvent = useCallback((s: CustomEventInit<unknown>) => {
    const state = typeof s.detail === 'string'
      ? s.detail.toLowerCase()
      : undefined;

    state === 'finalized' && notify(t('The transaction has been finalized!'), 'success');
  }, [notify, t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);

    return () => window.removeEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);
}
