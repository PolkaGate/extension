// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext, useState } from 'react';

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

export const ExtensionLockProvider: React.FC = ({ children }) => {
  const [isExtensionLocked, setIsExtensionLocked] = useState(true);

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
