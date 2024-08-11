// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Severity } from '../util/types';

import { useCallback, useContext } from 'react';

import { AlertContext } from '../components';

export default function useAlerts () {
  const { setAlerts } = useContext(AlertContext);

  const notify = useCallback((text: string, severity?: Severity) => {
    setAlerts((prev) => [...prev, { severity: severity || 'info', text }]);
  }, [setAlerts]);

  return { notify };
}
