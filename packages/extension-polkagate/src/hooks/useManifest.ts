// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useEffect, useState } from 'react';

export default function useManifest(): browser.runtime.Manifest | undefined {
  const [manifest, setManifest] = useState<browser.runtime.Manifest>();

  const fetchManifest = async () => {
    try {
      const response = await fetch('./manifest.json');
      const data = await response.json() as browser.runtime.Manifest;

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
