// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useContext, useMemo } from 'react';

import { AccountContext } from '../components';
import { accountsValidate } from '../messaging';

export default function useIsPasswordCorrect () {
  const { accounts } = useContext(AccountContext);

  const localAccounts = useMemo(
    () => accounts.filter(({ isExternal }) => !isExternal),
    [accounts]
  );

  const firstLocal = localAccounts[0];
  const hasNoLocalAccounts = localAccounts.length === 0;

  const validatePasswordAsync = useCallback(async (password: string): Promise<boolean> => {
    if (!firstLocal) {
      return true;
    }

    try {
      const isValid = await accountsValidate(firstLocal.address, password);

      return isValid;
    } catch (error) {
      console.error('Password validation failed:', error);

      return false;
    }
  }, [firstLocal]);

  return {
    hasNoLocalAccounts,
    validatePasswordAsync
  };
}
