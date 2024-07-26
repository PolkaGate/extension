// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { useEffect, useLayoutEffect, useState } from 'react';

import { getStorage, watchStorage } from '../components/Loading';
import { useTranslation } from '.';

// const DEFAULT_PROFILE_TAGS = {
//   ALL: 'All',
//   LEDGER: 'Ledger',
//   LOCAL: 'Local',
//   QR_ATTACHED: 'QR-attached',
//   WATCH_ONLY: 'Watch-only'
// };

export default function useProfileAccounts (initialAccountList: AccountsOrder[] | undefined, profile?: string) {
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

    watchStorage('profile', setProfile).catch(console.error);
  }, [profile, t]);

  useLayoutEffect(() => {
    if (!initialAccountList || !_profile) {
      return;
    }

    let accounts;

    switch (_profile) {
      case t('All'):
        return setProfileAccounts(initialAccountList);
      case t('Local'):
        accounts = initialAccountList.filter(({ account: { isExternal } }) => !isExternal);

        return setProfileAccounts(accounts);
      case t('Ledger'):
        accounts = initialAccountList.filter(({ account: { isHardware } }) => isHardware);

        return setProfileAccounts(accounts);
      case t('Watch-only'):
        accounts = initialAccountList.filter(({ account: { isExternal, isHardware, isQR } }) => isExternal && !isQR && !isHardware);

        return setProfileAccounts(accounts);
      case t('QR-attached'):
        accounts = initialAccountList.filter(({ account: { isQR } }) => isQR);

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
