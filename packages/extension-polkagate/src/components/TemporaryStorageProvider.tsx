// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { TemporaryStorage } from './contexts';

interface TemporaryStorageProviderProps {
  children?: React.ReactNode;
}

const TemporaryStorageProvider = ({ children }: TemporaryStorageProviderProps): React.ReactElement<TemporaryStorageProviderProps> => {
  const [value, setVal] = useState<any>();

  const setValue = useCallback((message: any) => {
    value === undefined ? setVal(message) : setVal({ ...value, ...message });
  }, [value]);

  return (
    <TemporaryStorage.Provider value={{ value, setValue }}>
      {children}
    </TemporaryStorage.Provider>
  );
};

export default TemporaryStorageProvider;

TemporaryStorageProvider.displayName = 'TemporaryStorage';
