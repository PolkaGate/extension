// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
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
 * @param condition - The condition that triggers the animation
 * @param config - Configuration options for the animation
 * @returns isAnimating: boolean - Current animation state
 */
export default function useAnimateOnce (condition: boolean | undefined, config: AnimateOnceConfig = {}): boolean {
  const [animate, setAnimate] = useState(false);
  const timeoutRef = useRef<Timer>();

  const { delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, onComplete, onStart } = config;

  // Cleanup function to clear any pending timeouts
  const cleanup = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
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
    if (condition) {
      if (delay) {
        timeoutRef.current = setTimeout(trigger, delay);
      } else {
        trigger();
      }
    }

    // Cleanup on unmount or when condition changes
    return cleanup;
  }, [cleanup, condition, delay, trigger]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return animate;
}
