// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { AUTO_LOCK_PERIOD_DEFAULT } from '../util/constants';
import useAutoLock from './useAutoLock';

const DELAY_TYPE = {
  day: 24 * 60, // minutes
  hour: 60, // minutes
  min: 1
};

const MINUTE_IN_MILLI_SECONDS = 60 * 1000;

export default function useAutoLockPeriod (): number | undefined {
  const autoLock = useAutoLock();

  return useMemo(() => {
    if (!autoLock) {
      return;
    }

    if (!autoLock.enabled) {
      return AUTO_LOCK_PERIOD_DEFAULT * MINUTE_IN_MILLI_SECONDS;
    }

    return autoLock.delay.value * DELAY_TYPE[autoLock.delay.type] * MINUTE_IN_MILLI_SECONDS;
  }, [autoLock]);
}
