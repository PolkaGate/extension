// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AccountsContext } from '@polkadot/extension-base/background/types';

import React, { useEffect, useState } from 'react';

import { canDerive } from '@polkadot/extension-base/utils';
import { AccountContext } from '@polkadot/extension-polkagate/src/components/contexts';
import { subscribeAccounts, tieAccount } from '@polkadot/extension-polkagate/src/messaging';
import { LOGIN_STATUS, type LoginInfo } from '@polkadot/extension-polkagate/src/popup/passwordManagement/types';
import { getStorage, setStorage, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { buildHierarchy } from '@polkadot/extension-polkagate/src/util/buildHierarchy';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

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
    if (!accounts?.length) {
      return;
    }

    // eslint-disable-next-line no-void
    void (async () => {
      try {
        // Migrate accounts to any chain if not already migrated
        const migrated = await getStorage(STORAGE_KEY.IS_ACCOUNT_MIGRATED_TO_ANY_CHAIN);

        if (!migrated) {
          await Promise.all(accounts.map(({ address }) => tieAccount(address, null)));
          await setStorage(STORAGE_KEY.IS_ACCOUNT_MIGRATED_TO_ANY_CHAIN, true);
        }
      } catch (error) {
        console.error(error);
      }
    })();
    // The hook updates accounts data, so we track only the accounts array length as the dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts?.length]);

  useEffect(() => {
    const fetchLoginInfo = async () => {
      chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName === 'local' && STORAGE_KEY.LOGIN_INFO in changes) {
          const newValue = changes[STORAGE_KEY.LOGIN_INFO].newValue as LoginInfo;

          setLoginInfo(newValue);
        }
      });
      const info = await getStorage(STORAGE_KEY.LOGIN_INFO) as LoginInfo;

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

      updateStorage(STORAGE_KEY.LOGIN_INFO, { addressesToForget: addresses }).catch(console.error);
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
