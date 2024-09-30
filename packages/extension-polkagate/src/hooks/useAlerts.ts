// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Severity } from '../util/types';

import { useCallback, useContext } from 'react';

import { AlertContext } from '../components';

export default function useAlerts () {
  const { alerts, setAlerts } = useContext(AlertContext);

  const notify = useCallback((text: string, severity?: Severity) => {
    setAlerts((prev) => [...prev, { severity: severity || 'info', text }]);
  }, [setAlerts]);

  const removeAlert = useCallback((index: number) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  }, [setAlerts]);

  return { alerts, notify, removeAlert };
}
