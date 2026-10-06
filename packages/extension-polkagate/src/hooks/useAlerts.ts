// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Severity } from '../util/types';

import { Chance } from 'chance';
import { useCallback, useContext, useMemo } from 'react';

import { AlertContext } from '../components';

export default function useAlerts() {
  const { alerts, setAlerts } = useContext(AlertContext);

  const random = useMemo(() => new Chance(), []);

  const removeAlert = useCallback((idToRemove: string) => {
    setAlerts((prev) => prev.filter(({ id }) => id !== idToRemove));
  }, [setAlerts]);

  const notify = useCallback((text: string, severity?: Severity, persist = false, action?: { label: string; onClick: () => void }) => {
    const newId = random.string({ length: 10 });
    let id = newId;

    setAlerts((prev) => {
      // Deduplicate — don't stack alerts with identical text
      if (prev.some((a) => a.text === text)) {
        id = prev.find((a) => a.text === text)!.id;

        return prev;
      }

      return [...prev, { action, id: newId, persist, severity: severity || 'info', text }];
    });

    return () => removeAlert(id);
  }, [random, removeAlert, setAlerts]);

  return { alerts, notify, removeAlert };
}
