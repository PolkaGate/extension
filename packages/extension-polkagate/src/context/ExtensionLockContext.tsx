// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useIsPasswordMigrated, useLocalAccounts } from '../hooks';
import { areAccountsLocksExpired } from '../messaging';

interface ExtensionLockContextProps {
  isExtensionLocked: boolean;
  setExtensionLock: (lock: boolean) => void;
}

const ExtensionLockContext = createContext<ExtensionLockContextProps | undefined>(undefined);

export const useExtensionLockContext = (): ExtensionLockContextProps => {
  const context = useContext(ExtensionLockContext);

  if (!context) {
    throw new Error('useExtensionLockContext must be used within an ExtensionLockProvider');
  }

  return context;
};

export const ExtensionLockProvider: React.FC<{ children: React.ReactElement }> = ({ children }: any) => {
  const isPasswordsMigrated = useIsPasswordMigrated();
  const localAccounts = useLocalAccounts();

  // Note: extensionLock is initially set to true.
  const [isExtensionLocked, setIsExtensionLocked] = useState(true);

  useEffect(() => {
   if (!localAccounts) {
    return;
   }

   // unlock extension if there is no local accounts
   if (localAccounts.length === 0) {
    setIsExtensionLocked(false);
   }
  }, [localAccounts]);

  useEffect(() => {
    const handleLockExpiredMessage = (msg: any) => {
      if (msg.type === 'LOCKED_ACCOUNTS_EXPIRED') {
             window.location.reload();
      }
    };

    chrome.runtime.onMessage.addListener(handleLockExpiredMessage);

    return () => chrome.runtime.onMessage.removeListener(handleLockExpiredMessage);
  }, []);

  useEffect(() => {
    isPasswordsMigrated && areAccountsLocksExpired()
      .then((res) => {
        setIsExtensionLocked(res);
      })
      .catch(console.error);
  }, [isPasswordsMigrated]);

  const setExtensionLock = (lock: boolean) => {
    setIsExtensionLocked(lock);
  };

  const contextValue: ExtensionLockContextProps = {
    isExtensionLocked,
    setExtensionLock
  };

  return (
    <ExtensionLockContext.Provider value={contextValue}>
      {children}
    </ExtensionLockContext.Provider>
  );
};
