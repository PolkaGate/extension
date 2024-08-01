// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

export default function useManifest (): chrome.runtime.Manifest | undefined {
  const [manifest, setManifest] = useState<chrome.runtime.Manifest>();

  const fetchManifest = async () => {
    try {
      const response = await fetch('./manifest.json');
      const data = await response.json() as chrome.runtime.Manifest;

      setManifest(data);
    } catch (error) {
      console.error('Error fetching manifest:', error);
    }
  };

  useEffect(() => {
    fetchManifest().catch(console.error);
  }, []);

  return manifest;
}
