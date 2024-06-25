// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';
import { AccountContext } from '../components';

type Profiles = {
  userDefinedProfiles: string[];
  defaultProfiles: string[];
};

export default function useProfiles(): Profiles {
  const { accounts } = useContext(AccountContext);

  return useMemo(() => {
    if (!accounts) {
      return {
        userDefinedProfiles: [],
        defaultProfiles: []
      };
    }

    // default profiles
    const texts = ['All'];
    const hasLocal = accounts.find(({ isExternal }) => !isExternal)
    if (hasLocal) {
      texts.push('Local')
    }

    const hasLedger = accounts.find(({ isHardware }) => isHardware)
    if (hasLedger) {
      texts.push('Ledger')
    }

    const hasWatchOnly = accounts.find(({ isExternal, isQR, isHardware }) => isExternal && !isQR && !isHardware);
    if (hasWatchOnly) {
      texts.push('Watch-only')
    }

    const hasQrAttached = accounts.find(({ isQR }) => isQR);
    if (hasQrAttached) {
      texts.push('QR-attached')
    }

    // user defined profiles
    const profiles = accounts.map(({ profile }) => profile).filter(Boolean) as string[];

    return {
      userDefinedProfiles: [...new Set(profiles)].sort(),
      defaultProfiles: texts
    };
  }, [accounts]);
}
