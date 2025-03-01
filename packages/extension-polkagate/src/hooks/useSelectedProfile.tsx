// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';

export default function useSelectedProfile(): string | undefined | null {
  const [selectedProfile, setSelectedProfile] = useState<string | null>();

  useEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile')
      .then((res) => {
        setSelectedProfile(res as string | undefined ?? null);
      })
      .catch(console.error);

    const unsubscribe = watchStorage('profile', setSelectedProfile);

    return () => {
      unsubscribe();
    };
  }, []);

  return selectedProfile;
}
