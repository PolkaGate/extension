// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '../fullscreen/homeFullScreen';
import { useEffect, useLayoutEffect, useState } from 'react';
import { getStorage, watchStorage } from '../components/Loading';
import { useTranslation } from '.';

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
    }).catch(console.error);

    watchStorage('profile', setProfile).catch(console.error);
  }, []);

  useLayoutEffect(() => {
    if (!initialAccountList) {
      return;
    }

    switch (_profile) {
      case t('All'):
        return setProfileAccounts(initialAccountList);
      case t('Local'):
        const localAccounts = initialAccountList.filter(({ account: { isExternal } }) => !isExternal);
        return setProfileAccounts(localAccounts);
      case t('Ledger'):
        const ledgerAccounts = initialAccountList.filter(({ account: { isHardware } }) => isHardware);
        return setProfileAccounts(ledgerAccounts);
      case t('Watch Only'):
        const watchOnlyAccounts = initialAccountList.filter(({ account: { isExternal, isQR, isHardware } }) => isExternal && !isQR && !isHardware);
        return setProfileAccounts(watchOnlyAccounts);
      case t('QR-attached'):
        const qrAttachedAccounts = initialAccountList.filter(({ account: { isQR } }) => isQR);
        return setProfileAccounts(qrAttachedAccounts);
      default:
        const useDefinedProfile = initialAccountList.filter(({ account }) => account?.profile && account.profile === _profile);
        return setProfileAccounts(useDefinedProfile);
    }
  }, [_profile, initialAccountList]);

  return profileAccounts && (profileAccounts?.length ? profileAccounts : initialAccountList);
}
