// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const RETRY_DELAY = 1100; // 1.1 second delay
export const MAX_RETRIES = 7;
export const BATCH_SIZE = 3;
const MAX_BACKOFF_MS = 60_000; // 60s cap

/**
 * Sleep function with exponential backoff and jitter, with logging
 * @param baseDelay Base delay in milliseconds
 * @param attempt Attempt number (0-based)
 * @param factor Backoff factor (default 2)
 * @param jitter Whether to apply jitter (default true)
 */
export const backoffSleep = (baseDelay: number, attempt: number, factor = 2, jitter = true): Promise<void> => {
  let delay = baseDelay * Math.pow(factor, attempt);

  if (jitter) {
    const rand = Math.random() * 0.4 + 0.8; // random between 0.8–1.2

    delay *= rand;
  }

  delay = Math.min(delay, MAX_BACKOFF_MS);
  const stack = new Error().stack?.split('\n')[2]?.trim() || 'unknown caller';

  console.log(`[backoffSleep] Waiting ${Math.round(delay)}ms (attempt ${attempt}, called from: ${stack})`);

  return new Promise((resolve) => setTimeout(resolve, delay));
};
