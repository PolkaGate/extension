// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useEffect, useState } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import useAccountsOrder from './useAccountsOrder';
import useProfileAccounts from './useProfileAccounts';
import useProfiles from './useProfiles';
import useSelectedProfile from './useSelectedProfile';

/**
 * Custom React hook that returns a categorized mapping of accounts based on profile tags.
 *
 * It uses the current selected profile to determine which accounts to return:
 * - If the selected profile is `ALL`, it categorizes all available accounts into predefined tags
 *   (LEDGER, LOCAL, QR_ATTACHED, WATCH_ONLY) and also includes user-defined profile tags.
 * - If a specific profile is selected, it groups accounts only under that profile.
 *
 * Categories are returned as a record where keys are profile tags and values are arrays of accounts.
 *
 * @returns {Record<string, any[]>} A dictionary mapping profile tags to lists of matching account entries.
 */
export default function useCategorizedAccountsInProfiles (): { initialAccountList: AccountJson[] | undefined, categorizedAccounts: Record<string, AccountJson[]>} {
  const initialAccountList = useAccountsOrder();
  const selectedProfile = useSelectedProfile();
  const { userDefinedProfiles } = useProfiles();
  const profileAccounts = useProfileAccounts(initialAccountList, selectedProfile);

  const [categorizedAccounts, setCategorizedAccounts] = useState<Record<string, AccountJson[]>>({});

  useEffect(() => {
    if (!initialAccountList || initialAccountList.length === 0 || !selectedProfile) {
      return;
    }

    const profileAccountsData = selectedProfile === PROFILE_TAGS.ALL ? initialAccountList : profileAccounts;

    if (!profileAccountsData) {
      return;
    }

    if (selectedProfile === PROFILE_TAGS.ALL) {
      const categorized: Record<string, AccountJson[]> = {};

      if (userDefinedProfiles) {
        userDefinedProfiles.forEach((tag) => {
          const accountsWithTag = initialAccountList.filter(({ profile }) =>
            profile?.split(',').includes(tag)
          );

          if (accountsWithTag.length > 0) {
            categorized[tag] = accountsWithTag;
          }
        });
      }

      Object.assign(categorized, {
        [PROFILE_TAGS.LEDGER]: initialAccountList.filter(({ isHardware }) => isHardware),
        [PROFILE_TAGS.LOCAL]: initialAccountList.filter(({ isExternal }) => !isExternal),
        [PROFILE_TAGS.QR_ATTACHED]: initialAccountList.filter(({ isQR }) => isQR),
        [PROFILE_TAGS.WATCH_ONLY]: initialAccountList.filter(({ isExternal, isHardware, isQR }) => isExternal && !isQR && !isHardware)
      });

      setCategorizedAccounts(categorized);
    } else {
      setCategorizedAccounts({
        [selectedProfile]: profileAccountsData
      });
    }
  }, [initialAccountList?.length, profileAccounts, selectedProfile, userDefinedProfiles]);

  return { categorizedAccounts, initialAccountList };
}
