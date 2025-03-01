// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { useEffect, useLayoutEffect, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';
import { useTranslation } from '.';

export const PROFILE_TAGS = {
  ALL: 'All',
  LEDGER: 'Ledger',
  LOCAL: 'Local',
  QR_ATTACHED: 'QR-attached',
  WATCH_ONLY: 'Watch-only'
};

/**
 * @description returns the list of accounts which has a profile tag, if profile is undefined it returns 'All' accounts
 */
export default function useProfileAccounts(initialAccountList: AccountsOrder[] | undefined, profile?: string) {
  const { t } = useTranslation();

  const [_profile, setProfile] = useState<string>();
  const [profileAccounts, setProfileAccounts] = useState<AccountsOrder[] | undefined>();

  useEffect(() => {
    if (profile) {
      return setProfile(profile);
    }

    getStorage('profile').then((res) => {
      setProfile(res as string || t('All'));
    }).catch((error) => {
      setProfile(t('All'));
      console.error('Error while reading profile from storage', error);
    });

    const unsubscribe = watchStorage('profile', setProfile);

    return () => {
      unsubscribe();
    };
  }, [profile, t]);

  useLayoutEffect(() => {
    if (!initialAccountList || !_profile) {
      return;
    }

    let accounts;

    switch (t(_profile)) {
      case t(PROFILE_TAGS.ALL):
        return setProfileAccounts(initialAccountList);

      case t(PROFILE_TAGS.LOCAL):
        accounts = initialAccountList.filter(({ account: { isExternal } }) => !isExternal);

        return setProfileAccounts(accounts);

      case t(PROFILE_TAGS.LEDGER):
        accounts = initialAccountList.filter(({ account: { isHardware } }) => isHardware);

        return setProfileAccounts(accounts);
      case t(PROFILE_TAGS.QR_ATTACHED):
        accounts = initialAccountList.filter(({ account: { isQR } }) => isQR);

        return setProfileAccounts(accounts);

      case t(PROFILE_TAGS.WATCH_ONLY):
        accounts = initialAccountList.filter(({ account: { isExternal, isHardware, isQR } }) => isExternal && !isQR && !isHardware);

        return setProfileAccounts(accounts);

      default:
        accounts = initialAccountList.filter(({ account }) => account?.profile && account.profile.split(',').includes(_profile));

        return setProfileAccounts(accounts);
    }
  }, [_profile, initialAccountList, t]);

  return profileAccounts &&
    (profileAccounts?.length
      ? profileAccounts
      : initialAccountList);
}
