// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

export default function useFavIcon(url: string | null | undefined): string | null | undefined {
  const [faviconUrl, setFaviconUrl] = useState<string | null | undefined>();

  const checkImageExists = useCallback(async (_url: string): Promise<boolean> => {
    try {
      const response = await fetch(_url, { method: 'HEAD' });

      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const fetchFaviconAlt = useCallback(async (_url: string) => {
    try {
      const baseUrl = new URL(_url);
      const possibleFaviconUrls = [
        `${baseUrl.origin}/favicon.ico`
      ];

      for (const faviconUrl of possibleFaviconUrls) {
        if (await checkImageExists(faviconUrl)) {
          return faviconUrl;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching favicon for ${_url}:`, error);

      return null;
    }
  }, [checkImageExists]);

  const fetchFavicon = useCallback(async (_url: string) => {
    try {
      const response = await fetch(_url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const selectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'meta[name="msapplication-TileImage"]'
      ];

      for (const selector of selectors) {
        const element = doc.querySelector(selector);

        if (element) {
          const href = element.getAttribute('href') || element.getAttribute('content');

          if (href) {
            setFaviconUrl(new URL(href, _url).href);

            return;
          }
        }
      }

      const altFavURL = await fetchFaviconAlt(_url);

      if (altFavURL) {
        setFaviconUrl(altFavURL);

        return;
      }

      setFaviconUrl(null);
    } catch (error) {
      console.error(`Error fetching favicon for ${_url}:`, error);
      setFaviconUrl(null);
    }
  }, [fetchFaviconAlt]);

  useEffect(() => {
    if (faviconUrl || !url) {
      return;
    }

    fetchFavicon(url).catch(console.error);
  }, [faviconUrl, fetchFavicon, url]);

  useEffect(() => {
    // reset faviconUrl based on url changes, applicable when there are multiple auth requests
    setFaviconUrl(undefined);
  }, [url]);

  return faviconUrl;
}
