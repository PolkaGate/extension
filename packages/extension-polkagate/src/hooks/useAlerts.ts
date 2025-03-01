// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Severity } from '../util/types';

import { Chance } from 'chance';
import { useCallback, useContext, useMemo } from 'react';

import { AlertContext } from '../components';

export const TIME_TO_REMOVE_ALERT = 5000; // 5 secs

export default function useAlerts() {
  const { alerts, setAlerts } = useContext(AlertContext);

  const random = useMemo(() => new Chance(), []);

  const removeAlert = useCallback((idToRemove: string) => {
    setAlerts((prev) => prev.filter(({ id }) => id !== idToRemove));
  }, [setAlerts]);

  const notify = useCallback((text: string, severity?: Severity) => {
    const id = random.string({ length: 10 });

    setAlerts((prev) => [...prev, { id, severity: severity || 'info', text }]);
    const timeout = setTimeout(() => removeAlert(id), TIME_TO_REMOVE_ALERT);

    return () => clearTimeout(timeout);
  }, [random, removeAlert, setAlerts]);

  return { alerts, notify, removeAlert };
}
