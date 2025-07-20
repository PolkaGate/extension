// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext } from '@polkadot/extension-base/background/types';
import { LOGIN_STATUS, type LoginInfo } from '@polkadot/extension-polkagate/src/popup/passwordManagement/types';

import React, { useEffect, useState } from 'react';

import { canDerive } from '@polkadot/extension-base/utils';
import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { subscribeAccounts } from '@polkadot/extension-polkagate/src/messaging';
import { getStorage, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { buildHierarchy } from '@polkadot/extension-polkagate/src/util/buildHierarchy';
import { NAMES_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

function initAccountContext (accounts: AccountJson[]): AccountsContext {
  const hierarchy = buildHierarchy(accounts);
  const master = hierarchy.find(({ isExternal, type }) => !isExternal && canDerive(type));

  return {
    accounts,
    hierarchy,
    master
  };
}

export default function AccountProvider ({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<null | AccountJson[]>(null);
  const [accountCtx, setAccountCtx] = useState<AccountsContext>({ accounts: [], hierarchy: [] });
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();

  useEffect(() => {
    subscribeAccounts(setAccounts).catch(console.log);
  }, []);

  useEffect(() => {
    const fetchLoginInfo = async () => {
      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName === 'local' && NAMES_IN_STORAGE.LOGIN_IFO in changes) {
          const newValue = changes[NAMES_IN_STORAGE.LOGIN_IFO].newValue as LoginInfo;

          setLoginInfo(newValue);
        }
      });
      const info = await getStorage(NAMES_IN_STORAGE.LOGIN_IFO) as LoginInfo;

      setLoginInfo(info);
    };

    fetchLoginInfo().catch(console.error);
  }, []);

  useEffect(() => {
    if (!loginInfo) {
      return;
    }

    if (loginInfo.status !== LOGIN_STATUS.FORGOT) {
      setAccountCtx(initAccountContext(accounts || []));
    } else if (loginInfo.status === LOGIN_STATUS.FORGOT) {
      setAccountCtx(initAccountContext([]));
      const addresses = accounts?.map((account) => account.address);

      updateStorage(NAMES_IN_STORAGE.LOGIN_IFO, { addressesToForget: addresses }).catch(console.error);
    }
  }, [accounts, loginInfo]);

  if (!accounts) {
    return null;
  }

  return (
    <AccountContext.Provider value={accountCtx}>
      {children}
    </AccountContext.Provider>
  );
}
