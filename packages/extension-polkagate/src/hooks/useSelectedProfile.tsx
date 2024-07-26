// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';

export default function useSelectedProfile (): string | undefined {
  const [selectedProfile, setSelectedProfile] = useState<string>();

  useEffect(() => {
    /** set profile text in local storage and watch its change to apply on the UI */
    getStorage('profile')
      .then((res) => {
        setSelectedProfile(res as string);
      })
      .catch(console.error);

    watchStorage('profile', setSelectedProfile).catch(console.error);
  }, []);

  return selectedProfile;
}
