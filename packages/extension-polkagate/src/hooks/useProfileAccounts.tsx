// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useLayoutEffect, useState } from 'react';
import type { AccountsOrder } from '../fullscreen/homeFullScreen';
import { getStorage, watchStorage } from '../components/Loading';
import { useTranslation } from '.';

export default function useProfileAccounts(initialAccountList: AccountsOrder[] | undefined) {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<string>();
  const [profileAccounts, setProfileAccounts] = useState<AccountsOrder[] | undefined>();

  useEffect(() => {
    getStorage('profile').then((res) => {
      setProfile(res as string || t('All'));
    }).catch(console.error);

    watchStorage('profile', setProfile).catch(console.error);
  }, []);

  useLayoutEffect(() => {
    if (!initialAccountList) {
      return;
    }

    switch (profile) {
      case t('Local'):
        const localAccounts = initialAccountList.filter(({ account: { isExternal } }) => !isExternal);
        return setProfileAccounts(localAccounts);
      case t('Watch Only'):
        const watchOnlyAccounts = initialAccountList.filter(({ account: { isExternal, isQR, isHardware } }) => isExternal && !isQR && !isHardware);
        return setProfileAccounts(watchOnlyAccounts);
      case t('QR-attached'):
        const qrAttachedAccounts = initialAccountList.filter(({ account: { isQR } }) => isQR);
        return setProfileAccounts(qrAttachedAccounts);
      default:
        setProfileAccounts(initialAccountList);
    }
  }, [profile]);

  return profileAccounts;
}
