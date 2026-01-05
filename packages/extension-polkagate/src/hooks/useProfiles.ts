// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useContext, useMemo } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext } from '../components';

interface Profiles {
  accountProfiles: string[];
  userDefinedProfiles: string[];
  defaultProfiles: string[];
}

/**
 * A React hook that derives profile categorization data from the available accounts.
 *
 * It returns:
 * - `accountProfiles`: The sorted list of profile tags assigned to the given `account`, if any.
 * - `defaultProfiles`: A list of default system-defined profile tags based on all loaded accounts.
 *   Includes tags like `ALL`, `LOCAL`, `LEDGER`, and `WATCH_ONLY` depending on account properties.
 * - `userDefinedProfiles`: A sorted list of all unique custom profile tags set by users across all accounts.
 *
 * This hook uses memoization to avoid unnecessary recalculations unless `account` or `accounts` change.
 *
 * @param {AccountJson} [account] - The specific account for which associated profile tags are returned.
 * @returns {Profiles} An object containing default, user-defined, and account-specific profiles.
 */
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

    const defaultProfilesSet = new Set<string>([PROFILE_TAGS.ALL]);
    const allUserProfiles = new Set<string>();

    for (const acc of accounts) {
      // Add default profile tags based on account type
      if (!acc.isExternal) {
        defaultProfilesSet.add(PROFILE_TAGS.LOCAL);
      }

      if (acc.isHardware) {
        defaultProfilesSet.add(PROFILE_TAGS.LEDGER);
      }

      if (acc.isQR) {
        defaultProfilesSet.add(PROFILE_TAGS.QR_ATTACHED);
      }

      if (!acc.isQR && acc.isExternal && !acc.isHardware) {
        defaultProfilesSet.add(PROFILE_TAGS.WATCH_ONLY);
      }

      // Collect user-defined profile tags
      acc.profile?.split(',').forEach((tag) => {
        if (tag) {
          allUserProfiles.add(tag);
        }
      });
    }

    // Extract current account's profile tags
    const accountProfiles = account?.profile
      ? account.profile.split(',').sort()
      : [];

    return {
      accountProfiles,
      defaultProfiles: [...defaultProfilesSet],
      userDefinedProfiles: [...allUserProfiles].sort()
    };
  }, [account, accounts]);
}
