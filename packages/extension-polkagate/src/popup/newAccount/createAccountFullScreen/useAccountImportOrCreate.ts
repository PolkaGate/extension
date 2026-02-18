// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountContext } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useIsPasswordCorrect from '@polkadot/extension-polkagate/src/hooks/useIsPasswordCorrect';
import { createAccountExternal, createAccountSuri } from '@polkadot/extension-polkagate/src/messaging';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { DEMO_ACCOUNT, PROFILE_TAGS, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { DEFAULT_TYPE } from '@polkadot/extension-polkagate/src/util/defaultType';

import { resetOnForgotPassword } from './resetAccounts';
import { type AccountInfo, STEP } from './types';

export function useAccountImportOrCreate<T extends AccountInfo = AccountInfo>({ accountType, onSuccessPath = '/',
  validator }: { accountType?: KeypairType, onSuccessPath?: string; validator?: (suri: string, type?: KeypairType) => Promise<T> }) {
  const navigate = useNavigate();
  const { accounts } = useContext(AccountContext);
  const { t } = useTranslation();
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

  const onConfirm = useCallback(async({ isImport = true, seed }: {seed: string | undefined | null, isImport?: boolean}) => {
    if (!name || !password || !seed) {
      return;
    }

    setIsBusy(true);
    const isPasswordCorrect = await validatePasswordAsync(password);

    if (!isPasswordCorrect) {
      setError(t('Incorrect password'));
      setIsBusy(false);

      return;
    }

    try {
      const resetOk = await resetOnForgotPassword();

      if (!resetOk) {
        setIsBusy(false);

        return setError(t('Failed to reset accounts'));
      }

      const created = await createAccountSuri(name, password, seed, accountType || DEFAULT_TYPE);

      if (!created) {
        setIsBusy(false);

        return setError(t('Failed to create account'));
      }

      const isFirstAccount = accounts?.length === 0;

      if (isFirstAccount) {
        await createAccountExternal('Demo account', DEMO_ACCOUNT, undefined);
      }

      const toProfile = isFirstAccount ? PROFILE_TAGS.ALL : PROFILE_TAGS.LOCAL;

      const okProfile = await setStorage(STORAGE_KEY.SELECTED_PROFILE, toProfile);
      const okMigrated = await setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true);

      isImport && setStorage(STORAGE_KEY.CHECK_BALANCE_ON_ALL_CHAINS, true) as unknown as void;

      if (!okProfile || !okMigrated) {
        console.warn('Failed to persist profile or migration flag');
      }

      navigate(onSuccessPath) as void;
      window.location.reload();
    } catch (error) {
      setIsBusy(false);
      console.error(error);
    }
  }, [name, password, validatePasswordAsync, t, accountType, accounts?.length, navigate, onSuccessPath]);

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
