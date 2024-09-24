// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { IPFS_GATEWAYS } from './constants';

const MAX_RETRY_ATTEMPTS = IPFS_GATEWAYS.length;
const INITIAL_BACKOFF_TIME = 1000; // 1 second
const MAX_BACKOFF_TIME = 10000; // 10 seconds

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

  const getContentUrl = useCallback((url: string | undefined) => {
    if (!url) {
      return { isIPFS: false, sanitizedUrl: undefined };
    }

    if (url.startsWith('https')) {
      return { isIPFS: false, sanitizedUrl: url };
    }

    let cid = url.replace(/^ipfs:\/\/ipfs\/|^ipfs:\/\/|^ipfs\//, '');

    cid = cid.replace(/^\/+/, '');

    return { isIPFS: !cid.startsWith('http'), sanitizedUrl: cid };
  }, []);

  const fetchNftData = useCallback(async <T>(contentUrl: string | undefined, image = false): Promise<T | null> => {
    if (!contentUrl) {
      return null;
    }

    const { isIPFS, sanitizedUrl } = getContentUrl(contentUrl);

    if (!sanitizedUrl) {
      return null;
    }

    if (!isIPFS) {
      const response = await fetch(sanitizedUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return image ? response.url as T : await response.json() as T;
    }

    for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
      try {
        const url = IPFS_GATEWAYS[i] + sanitizedUrl;
        const response = await fetchWithRetry(url, i);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return image ? response.url as T : await response.json() as T;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);

        if (i === MAX_RETRY_ATTEMPTS - 1) {
          console.error('Failed to fetch NFT data from all gateways');

          return null;
        }
      }
    }

    return null;
  }, [fetchWithRetry, getContentUrl]);

  return { fetchNftData };
};
