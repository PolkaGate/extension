// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestBiometricAuthentication } from '@polkadot/extension-base/utils/biometric';

import { useCallback, useEffect, useState } from 'react';

import { getBiometricUnlockStatus } from '../messaging';
import { authenticateWithBiometric } from '../util/biometric';
import useIsPasswordMigrated from './useIsPasswordMigrated';

interface UseBiometricAction {
  isBiometricAvailable: boolean;
  isBiometricBusy: boolean;
  runBiometricAction: <T>(action: (auth: RequestBiometricAuthentication) => Promise<T>) => Promise<T | undefined>;
}

export default function useBiometricAction(): UseBiometricAction {
  const isPasswordMigrated = useIsPasswordMigrated();
  const [credentialId, setCredentialId] = useState<string>();
  const [prfSalt, setPrfSalt] = useState<string>();
  const [isBiometricBusy, setBiometricBusy] = useState(false);

  useEffect(() => {
    getBiometricUnlockStatus()
      .then((status) => {
        if (status.enabled && status.credentialId && status.prfSalt) {
          setCredentialId(status.credentialId);
          setPrfSalt(status.prfSalt);
        }
      })
      .catch(console.error);
  }, []);

  const runBiometricAction = useCallback(async <T>(action: (auth: RequestBiometricAuthentication) => Promise<T>): Promise<T | undefined> => {
    if (!credentialId || !prfSalt || isPasswordMigrated !== true) {
      return undefined;
    }

    setBiometricBusy(true);

    try {
      const auth = await authenticateWithBiometric(credentialId, prfSalt);

      return await action(auth);
    } finally {
      setBiometricBusy(false);
    }
  }, [credentialId, isPasswordMigrated, prfSalt]);

  return {
    isBiometricAvailable: Boolean(credentialId && prfSalt && isPasswordMigrated === true),
    isBiometricBusy,
    runBiometricAction
  };
}
