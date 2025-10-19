// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useIsPasswordCorrect from '@polkadot/extension-polkagate/src/hooks/useIsPasswordCorrect';
import { createAccountSuri } from '@polkadot/extension-polkagate/src/messaging';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

import { resetOnForgotPassword } from './resetAccounts';
import { type AccountInfo, STEP } from './types';

export function useAccountImportOrCreate<T extends AccountInfo = AccountInfo>({
  onSuccessPath = '/',
  validator
}: { onSuccessPath?: string; validator?: (suri: string, type?: KeypairType) => Promise<T> }) {
  const navigate = useNavigate();
  const { hasNoLocalAccounts, validatePasswordAsync } = useIsPasswordCorrect();

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [name, setName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [step, setStep] = useState<STEP>(STEP.SEED);

  useEffect((): void => {
    setError(undefined);
  }, [password]);

  const onValidateSeed = useCallback(async (input: string, type?: KeypairType) => {
    if (!validator) {
      return;
    }

    try {
      const account = await validator(input, type);

      setError(undefined);

      return account;
    } catch (e) {
      setError(String(e));

      return null;
    }
  }, [validator]);

  const onConfirm = useCallback(async (seed: string | undefined | null, type?: KeypairType) => {
    if (!name || !password || !seed) {
      return;
    }

    setIsBusy(true);
    const isPasswordCorrect = await validatePasswordAsync(password);

    if (!isPasswordCorrect) {
      setError('Password incorrect');
      setIsBusy(false);

      return;
    }

    try {
      await resetOnForgotPassword();

      await createAccountSuri(name, password, seed, type || DEFAULT_TYPE);
      await setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.LOCAL);
      await setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true);
      navigate(onSuccessPath) as void;
    } catch (error) {
      setIsBusy(false);
      console.error(error);
    }
  }, [name, password, validatePasswordAsync, navigate, onSuccessPath]);

  return {
    error,
    hasNoLocalAccounts,
    isBusy,
    name,
    onConfirm,
    onValidateSeed,
    password,
    setError,
    setName,
    setPassword,
    setStep,
    step
  };
}
