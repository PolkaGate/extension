// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { accountsValidate } from '../messaging';
import useLocalAccounts from './useLocalAccounts';

export default function useIsPasswordCorrect() {
  const localAccounts = useLocalAccounts();

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
