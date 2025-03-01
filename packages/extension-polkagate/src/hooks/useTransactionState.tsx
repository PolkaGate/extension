// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';

import useTranslation from './useTranslation';
import { useAlerts } from '.';

export default function useTransactionState() {
  const { t } = useTranslation();
  const { notify } = useAlerts();

  const handleTxEvent = useCallback((s: CustomEventInit<unknown>) => {
    const event = s.detail;

    if (event) {
      const state = Object.keys(event)[0];

      state === 'finalized' && notify(t('The transaction has been finalized!'), 'success');
    }
  }, [notify, t]);

  useEffect(() => {
    window.addEventListener('transactionState', handleTxEvent);
  }, [handleTxEvent]);
}
