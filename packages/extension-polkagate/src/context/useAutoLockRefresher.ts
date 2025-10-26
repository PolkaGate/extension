// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';

import { useAutoLockPeriod } from '@polkadot/extension-polkagate/src/hooks';
import { setUnlockExpiry } from '@polkadot/extension-polkagate/src/messaging';

function throttle<F extends (...args: unknown[]) => void>(func: F, limit: number) {
  let inThrottle = false;

  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const AUTO_LOCK_THROTTLE_INTERVAL_MS = 10_000;

export default function useAutoLockRefresher () {
  const autoLockPeriod = useAutoLockPeriod();

  useEffect(() => {
    if (!autoLockPeriod) {
      return;
    }

    const sendExpiry = throttle(() => {
      console.info('sending expiry ...');
      setUnlockExpiry(Date.now() + autoLockPeriod).catch(console.error);
    }, AUTO_LOCK_THROTTLE_INTERVAL_MS);

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'] as const;

    events.forEach((e) => window.addEventListener(e, sendExpiry));

    return () => {
      events.forEach((e) => window.removeEventListener(e, sendExpiry));
    };
  }, [autoLockPeriod]);
}
