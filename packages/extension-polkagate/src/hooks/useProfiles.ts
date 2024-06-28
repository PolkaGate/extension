// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext, useMemo } from 'react';
import { AccountContext } from '../components';
import type { AccountJson } from '@polkadot/extension-base/background/types';

type Profiles = {
  userDefinedProfiles: string[];
  defaultProfiles: string[];
};

export default function useProfiles(account?: AccountJson): Profiles {
  const { accounts } = useContext(AccountContext);

  return useMemo(() => {
     if (!accounts) {
      return {
        userDefinedProfiles: [],
        defaultProfiles: []
      };
    }
   
    // default profiles
    const defaultProfiles = ['All'];
    const hasLocal = accounts.find(({ isExternal }) => !isExternal)
    if (hasLocal) {
     defaultProfiles.push('Local')
    }

    const hasLedger = accounts.find(({ isHardware }) => isHardware)
    if (hasLedger) {
     defaultProfiles.push('Ledger')
    }

    const hasWatchOnly = accounts.find(({ isExternal, isQR, isHardware }) => isExternal && !isQR && !isHardware);
    if (hasWatchOnly) {
     defaultProfiles.push('Watch-only')
    }

    const hasQrAttached = accounts.find(({ isQR }) => isQR);
    if (hasQrAttached) {
     defaultProfiles.push('QR-attached')
    }

    if (account) { // return only the account profiles as userDefinedProfiles
      const profiles = account?.profile?.split(',');

      return {
        defaultProfiles,
        userDefinedProfiles: profiles?.sort() || []
      };
    }

    // user defined profiles
    const profiles = accounts.map(({ profile }) => profile ? profile.split(',') : undefined).flat().filter(Boolean) as string[];

    return {
      defaultProfiles,
      userDefinedProfiles: [...new Set(profiles)].sort()
    };
  }, [account, accounts]);
}
