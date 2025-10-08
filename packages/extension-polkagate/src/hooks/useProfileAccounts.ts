// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { useEffect, useMemo, useState } from 'react';

import { PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { getStorage, watchStorage } from '../components/Loading';
import useTranslation from './useTranslation';

/**
 * @description returns the list of accounts which has a profile tag, if profile is undefined it returns 'All' accounts
 */
export default function useProfileAccounts (initialAccountList: AccountJson[] | undefined, profile?: string | null) {
  const { t } = useTranslation();

  const [_profile, setProfile] = useState<string>();

  useEffect(() => {
    if (profile) {
      return setProfile(profile);
    }

    getStorage(STORAGE_KEY.SELECTED_PROFILE).then((res) => {
      setProfile(res as string || t('All'));
    }).catch((error) => {
      setProfile(t('All'));
      console.error('Error while reading profile from storage', error);
    });

    const unsubscribe = watchStorage(STORAGE_KEY.SELECTED_PROFILE, setProfile);

    return () => {
      unsubscribe();
    };
  }, [profile, t]);

  const profileAccounts = useMemo(() => {
    if (!initialAccountList || !_profile) {
      return;
    }

    switch (t(_profile)) {
      case t(PROFILE_TAGS.ALL):
        return initialAccountList;

      case t(PROFILE_TAGS.LOCAL):
        return initialAccountList.filter(({ isExternal }) => !isExternal);

      case t(PROFILE_TAGS.LEDGER):
        return initialAccountList.filter(({ isHardware }) => isHardware);

      case t(PROFILE_TAGS.QR_ATTACHED):
        return initialAccountList.filter(({ isQR }) => isQR);

      case t(PROFILE_TAGS.WATCH_ONLY):
        return initialAccountList.filter(({ isExternal, isHardware, isQR }) => isExternal && !isQR && !isHardware);

      default:
        return initialAccountList.filter(({ profile }) => profile?.split(',').includes(_profile));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_profile, initialAccountList?.length, t]);

  return profileAccounts &&
    (profileAccounts?.length
      ? profileAccounts
      : initialAccountList);
}
