// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

export default function useAnimateOnce (condition: boolean | undefined): boolean {
  const [animate, setAnimate] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (condition && !prefersReducedMotion) {
      setAnimate(true);

      const timeoutId = setTimeout(() => setAnimate(false), 500);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [condition, prefersReducedMotion]);

  return animate;
}
