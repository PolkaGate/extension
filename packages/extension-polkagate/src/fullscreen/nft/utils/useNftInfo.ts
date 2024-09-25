// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { INITIAL_BACKOFF_TIME, IPFS_GATEWAYS, MAX_BACKOFF_TIME, MAX_RETRY_ATTEMPTS } from './constants';
import { getContentUrl } from './util';

export const useNftInfo = () => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetry = useCallback(async (url: string, attempt = 0): Promise<Response> => {
    try {
      const response = await fetch(url);

      if (response.status === 429) { // Too Many Requests
        throw new Error('Rate limited');
      }

      return response;
    } catch (error) {
      if (attempt < MAX_RETRY_ATTEMPTS - 1) {
        const backoffTime = Math.min(INITIAL_BACKOFF_TIME * Math.pow(2, attempt), MAX_BACKOFF_TIME);

        console.log(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
        await sleep(backoffTime);

        return fetchWithRetry(url, attempt + 1);
      }

      throw error;
    }
  }, []);

  const fetchData = useCallback(async <T>(contentUrl: string | undefined, image = false): Promise<T | null> => {
    if (!contentUrl) {
      return null;
    }

    const { isIPFS, sanitizedUrl } = getContentUrl(contentUrl);

    if (!sanitizedUrl) {
      return null;
    }

    const fetchAndProcess = async (url: string) => {
      const response = await fetchWithRetry(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return image ? response.url as T : await response.json() as T;
    };

    if (!isIPFS) {
      return fetchAndProcess(sanitizedUrl);
    }

    for (const gateway of IPFS_GATEWAYS) {
      try {
        return await fetchAndProcess(gateway + sanitizedUrl);
      } catch (error) {
        console.error(`Failed to fetch from ${gateway}:`, error);
      }
    }

    console.error('Failed to fetch NFT/Unique data from all gateways');

    return null;
  }, [fetchWithRetry]);

  return { fetchData };
};
