// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useMemo } from 'react';

import { AccountContext } from '../components';

interface Profiles {
  accountProfiles: string[];
  userDefinedProfiles: string[];
  defaultProfiles: string[];
}

export default function useProfiles(account?: AccountJson): Profiles {
  const { accounts } = useContext(AccountContext);

  return useMemo(() => {
    if (!accounts) {
      return {
        accountProfiles: [],
        defaultProfiles: [],
        userDefinedProfiles: []
      };
    }

    // default profiles
    const defaultProfiles = ['All'];
    const hasLocal = accounts.find(({ isExternal }) => !isExternal);

    if (hasLocal) {
      defaultProfiles.push('Local');
    }

    const hasLedger = accounts.find(({ isHardware }) => isHardware);

    if (hasLedger) {
      defaultProfiles.push('Ledger');
    }

    const hasWatchOnly = accounts.find(({ isExternal, isHardware, isQR }) => isExternal && !isQR && !isHardware);

    if (hasWatchOnly) {
      defaultProfiles.push('Watch-only');
    }

    const hasQrAttached = accounts.find(({ isQR }) => isQR);

    if (hasQrAttached) {
      defaultProfiles.push('QR-attached');
    }

    let accountProfiles: string[] = [];

    if (account) {
      const profiles = account.profile?.split(',');

      accountProfiles = profiles ? profiles.sort() : [];
    }

    // user defined profiles
    const profiles = accounts.map(({ profile }) => profile ? profile.split(',') : undefined).flat().filter(Boolean) as string[];

    return {
      accountProfiles,
      defaultProfiles,
      userDefinedProfiles: [...new Set(profiles)].sort()
    };
  }, [account, accounts]);
}
