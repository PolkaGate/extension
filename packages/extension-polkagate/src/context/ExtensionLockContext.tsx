// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useIsPasswordMigrated } from '../hooks';
import { areAccountsLocksExpired } from '../messaging';
import useAutoLockRefresher from './useAutoLockRefresher';

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

interface LockExpiredMessage { type: 'LOCKED_ACCOUNTS_EXPIRED' }

export const ExtensionLockProvider: React.FC<{ children: React.ReactElement }> = ({ children }: any) => {
  const isPasswordsMigrated = useIsPasswordMigrated();

  useAutoLockRefresher();

  // Note: extensionLock is initially set to true.
  const [isExtensionLocked, setIsExtensionLocked] = useState(true);

  useEffect(() => {
     isPasswordsMigrated && areAccountsLocksExpired()
      .then((res) => {
        setIsExtensionLocked(res);
      })
      .catch(console.error);

    const handleLockExpiredMessage = (msg: LockExpiredMessage) => {
      if (msg.type === 'LOCKED_ACCOUNTS_EXPIRED') {
        window.location.reload();
      }
    };

    chrome.runtime.onMessage.addListener(handleLockExpiredMessage);

    return () => chrome.runtime.onMessage.removeListener(handleLockExpiredMessage);
  }, [isPasswordsMigrated]);

  const setExtensionLock = useCallback((lock: boolean) => {
    setIsExtensionLocked(lock);
  }, []);

  const contextValue = useMemo(
    () => ({ isExtensionLocked, setExtensionLock }),
    [isExtensionLocked, setExtensionLock]
  );

  return (
    <ExtensionLockContext.Provider value={contextValue}>
      {children}
    </ExtensionLockContext.Provider>
  );
};
