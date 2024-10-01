// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Severity } from '../util/types';

import { useCallback, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AlertContext } from '../components';

export const TIME_TO_REMOVE_ALERT = 5000; // 5 secs

export default function useAlerts () {
  const { alerts, setAlerts } = useContext(AlertContext);

  const removeAlert = useCallback((idToRemove: string) => {
    setAlerts((prev) => prev.filter(({ id }) => id !== idToRemove));
  }, [setAlerts]);

  const notify = useCallback((text: string, severity?: Severity) => {
    const id = uuidv4();

    setAlerts((prev) => [...prev, { id, severity: severity || 'info', text }]);
    const timeout = setTimeout(() => removeAlert(id), TIME_TO_REMOVE_ALERT);

    return () => clearTimeout(timeout);
  }, [removeAlert, setAlerts]);

  return { alerts, notify, removeAlert };
}
