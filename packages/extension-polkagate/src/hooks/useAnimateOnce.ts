// Copyright 2019-2025 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useRef, useState } from 'react';

interface AnimateOnceConfig {
  duration?: number;
  delay?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

const DEFAULT_DURATION = 500;
const DEFAULT_DELAY = 0;

type Timer = ReturnType<typeof setTimeout>;

/**
 * A hook that triggers a one-time animation state when a condition becomes true.
 * Accounts for 'prefers-reduced-motion' settings.
 * @param condition - The condition that triggers the animation
 * @param config - Configuration options for the animation
 * @returns animate: boolean - Current animation state
 */
export default function useAnimateOnce(condition: boolean | undefined, config = {} as AnimateOnceConfig): boolean {
  const [animate, setAnimate] = useState(false);
  const timeoutRef = useRef<Timer>();

  const { delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, onComplete, onStart } = config;

  // Check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cleanup function to clear any pending timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const trigger = useCallback(() => {
    cleanup();
    onStart?.();
    setAnimate(true);

    timeoutRef.current = setTimeout(() => {
      setAnimate(false);
      onComplete?.();
    }, duration);
  }, [cleanup, duration, onStart, onComplete]);

  useEffect(() => {
    if (condition && !prefersReducedMotion) {
      timeoutRef.current = setTimeout(trigger, delay);
    }

    return cleanup;
  }, [cleanup, condition, delay, trigger, prefersReducedMotion]);

  return animate;
}
