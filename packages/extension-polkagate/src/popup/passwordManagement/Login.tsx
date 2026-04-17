// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import useCheckMasterPassword from '@polkadot/extension-polkagate/src/hooks/useCheckMasterPassword';
import { unlockAllAccounts, windowOpen } from '@polkadot/extension-polkagate/src/messaging';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { blake2AsHex } from '@polkadot/util-crypto';

import { Box as BoxIcon } from '../../assets/icons';
import { ActionButton, GradientBox, GradientButton, MySnackbar, MySwitch, PasswordInput } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { openOrFocusTab } from '../../fullscreen/accountDetails/components/CommonTasks';
import { useAutoLockPeriod, useBackground, useIsExtensionPopup, useIsHideNumbers, useIsPasswordMigrated, useTranslation } from '../../hooks';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { getBiometricUnlockStatus, unlockAllAccountsWithBiometric } from '../../messaging';
import { unlockWithBiometric } from '../../util/biometric';
import { isPasswordCorrect } from '../settings/extensionSettings/ManagePassword';
import { STEPS } from './constants';
import Header from './Header';
import { LOGIN_STATUS, type LoginInfo } from './types';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function Content({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isExtension = useIsExtensionPopup();
  const isPasswordMigrated = useIsPasswordMigrated();
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();
  const { setExtensionLock } = useExtensionLockContext();
  const autoLockPeriod = useAutoLockPeriod();
  const isUnlockingRef = useRef(false);
  const autoBiometricAttemptedRef = useRef(false);

  const [hashedPassword, setHashedPassword] = useState<string>();
  const [plainPassword, setPlainPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isUnlocking, setUnlocking] = useState(false);
  const [isBiometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricUnlocking, setBiometricUnlocking] = useState(false);
  const [biometricCredentialId, setBiometricCredentialId] = useState<string>();
  const [biometricPrfSalt, setBiometricPrfSalt] = useState<string>();
  const [biometricError, setBiometricError] = useState<string>();
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);

  const { accountsNeedMigration, hasLocalAccounts } = useCheckMasterPassword((isUnlocking && isPasswordMigrated === false) ? plainPassword : undefined);

  const onPassChange = useCallback((pass: string | null): void => {
    if (!pass) {
      setPlainPassword(undefined);
      setHashedPassword(undefined);

      return;
    }

    setPlainPassword(pass);
    setIsPasswordError(false);
    const hashedPassword = blake2AsHex(pass, 256); // Hash the string with a 256-bit output

    setHashedPassword(hashedPassword);
  }, []);

  useEffect(() => {
    getBiometricUnlockStatus()
      .then((biometricStatus) => {
        const isEnabled = biometricStatus.enabled && biometricStatus.credentialId && biometricStatus.prfSalt;

        setBiometricAvailable(Boolean(isEnabled));
        setBiometricCredentialId(biometricStatus.credentialId);
        setBiometricPrfSalt(biometricStatus.prfSalt);
        setShowPasswordFallback(true);
      })
      .catch((error) => {
        console.error(error);
        setBiometricAvailable(false);
        setShowPasswordFallback(true);
      });
  }, []);

  const canUnlockDirectly = useCallback((isOldPasswordCorrect: boolean, oldPasswordExists: boolean) => {
    const haveUnifiedPassword = hasLocalAccounts && accountsNeedMigration?.length === 0;
    const sharedPasswordNoLoginSet = haveUnifiedPassword && !oldPasswordExists;

    return isPasswordMigrated ||
      (isOldPasswordCorrect && accountsNeedMigration?.length === 0) ||
      sharedPasswordNoLoginSet;
  }, [accountsNeedMigration?.length, hasLocalAccounts, isPasswordMigrated]);

  const handleDirectUnlock = useCallback(async (password: string, period: number) => {
    const success = await unlockAllAccounts(password, period, true);

    if (success) {
      setExtensionLock(false);
      hasLocalAccounts && setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true) as unknown as void;
      setStorage(STORAGE_KEY.IS_FORGOTTEN, undefined) as unknown as void;
    } else {
      setExtensionLock(true);
      setIsPasswordError(true);
    }

    setPlainPassword(undefined);
  }, [hasLocalAccounts, setExtensionLock]);

  const handlePasswordMigration = useCallback(async () => {
    await updateStorage(STORAGE_KEY.LOGIN_INFO, { lastLoginTime: Date.now(), status: LOGIN_STATUS.SET }); // DEPRECATED, will be removed in future releases
    setStorage(STORAGE_KEY.IS_FORGOTTEN, undefined) as unknown as void;
    setHashedPassword(undefined);
    setExtensionLock(false);
    const path = '/migratePasswords';

    isExtension
      ? windowOpen(path).catch(console.error)
      : navigate(path) as void;
  }, [isExtension, navigate, setExtensionLock]);

  const tryUnlock = useCallback(async () => {
    if (
      !plainPassword ||
      !autoLockPeriod ||
      !isUnlocking ||
      isUnlockingRef.current ||
      (!accountsNeedMigration && !isPasswordMigrated)
    ) {
      return;
    }

    isUnlockingRef.current = true; // 🚧 prevent parallel unlocks

    try {
      const oldPasswordExists = !!(await getStorage(STORAGE_KEY.LOGIN_INFO) as LoginInfo)?.hashedPassword;
      const isOldPasswordCorrect = hashedPassword ? await isPasswordCorrect(hashedPassword, true) : false; // DEPRECATED, will be removed in future releases

      const canUnlock = canUnlockDirectly(isOldPasswordCorrect, oldPasswordExists);

      if (canUnlock) {
        await handleDirectUnlock(plainPassword, autoLockPeriod);

        return;
      }

      const needsPasswordMigration = accountsNeedMigration?.length && (isOldPasswordCorrect || !oldPasswordExists);

      if (needsPasswordMigration) {
        await handlePasswordMigration();

        return;
      }

      // not migrated and old password exist but it is incorrect
      setIsPasswordError(true);
    } catch (e) {
      console.error(e);
      setIsPasswordError(true);
    } finally {
      setUnlocking(false);

      isUnlockingRef.current = false; // ✅ unlock finished
    }
  }, [accountsNeedMigration, autoLockPeriod, canUnlockDirectly, handleDirectUnlock, handlePasswordMigration, hashedPassword, isPasswordMigrated, isUnlocking, plainPassword]);

  useEffect(() => {
    tryUnlock() as unknown as void;
  }, [tryUnlock]);

  const onUnlock = useCallback(() => {
    if (!plainPassword || autoLockPeriod === undefined || isPasswordMigrated === undefined) {
      return;
    }

    setUnlocking(true);
  }, [autoLockPeriod, isPasswordMigrated, plainPassword]);

  const onForgotPassword = useCallback((): void => {
    if (isExtension) {
      setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);

      return;
    }

    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION_FS);
    openOrFocusTab('/forgot-password', true);
  }, [isExtension, setStep]);

  const onBiometricUnlock = useCallback(async (silentFailure = false): Promise<boolean> => {
    if (!autoLockPeriod || !biometricCredentialId || !biometricPrfSalt) {
      return false;
    }

    setBiometricUnlocking(true);
    setBiometricError(undefined);

    try {
      const biometricRequest = await unlockWithBiometric(autoLockPeriod, biometricCredentialId, biometricPrfSalt);
      const success = await unlockAllAccountsWithBiometric(biometricRequest);

      if (success) {
        setIsPasswordError(false);
        setPlainPassword(undefined);
        setHashedPassword(undefined);
        setShowPasswordFallback(false);
        setExtensionLock(false);
        hasLocalAccounts && setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true) as unknown as void;
        setStorage(STORAGE_KEY.IS_FORGOTTEN, undefined) as unknown as void;

        return true;
      }

      setShowPasswordFallback(true);

      if (!silentFailure) {
        setBiometricError(t('Biometric unlock failed. Please use your password.'));
      }
    } catch (error) {
      console.error(error);

      setShowPasswordFallback(true);

      if (!silentFailure) {
         const rawMessage = (error as Error).message;

        setBiometricError(rawMessage || t('Biometric unlock failed. Please use your password.'));
      }
    } finally {
      setBiometricUnlocking(false);
    }

    return false;
  }, [autoLockPeriod, biometricCredentialId, biometricPrfSalt, hasLocalAccounts, setExtensionLock, t]);

  useEffect(() => {
    if (!isBiometricAvailable || !autoLockPeriod || !biometricCredentialId || !biometricPrfSalt || autoBiometricAttemptedRef.current) {
      return;
    }

    autoBiometricAttemptedRef.current = true;
    void onBiometricUnlock(true);
  }, [autoLockPeriod, biometricCredentialId, biometricPrfSalt, isBiometricAvailable, onBiometricUnlock]);

  return (
    <Grid container item justifyContent='start' sx={{ p: isExtension ? '18px 24px 24px' : '18px 32px 32px' }}>
      <Box
        component='img'
        src={BoxIcon as string}
        sx={{ height: isExtension ? '118px' : '145px', m: isExtension ? '8px auto 6px' : '17px auto 7px', width: isExtension ? '114px' : '140px' }}
      />
      <Typography sx={{ mb: '8px', textAlign: 'center', width: '100%' }} textTransform='uppercase' variant='H-2'>
        {t('Welcome back')}
      </Typography>
      <Typography color='text.secondary' sx={{ mb: '18px', textAlign: 'center', width: '100%' }} variant='B-1'>
        {t(isBiometricAvailable && !showPasswordFallback ? 'Use biometrics to continue' : 'Enter your password to continue')}
      </Typography>
      {(!isBiometricAvailable || showPasswordFallback) &&
        <PasswordInput
          focused={!isBiometricAvailable}
          hasError={isPasswordError}
          onEnterPress={onUnlock}
          onPassChange={onPassChange}
          title={t('Password')}
        />
      }
      <MySwitch
        checked={isHideNumbers}
        columnGap='8px'
        label={t('Hide Balance')}
        onChange={toggleHideNumbers}
        showHidden
        style={{ marginTop: '20px' }}
      />
      {isBiometricAvailable &&
        <GradientButton
          disabled={isUnlocking || isBiometricUnlocking}
          isBusy={isBiometricUnlocking}
          onClick={() => void onBiometricUnlock()}
          style={{ height: '44px', marginTop: '20px', width: '100%' }}
          text={t('Unlock with biometrics')}
        />
      }
      {(!isBiometricAvailable || showPasswordFallback) &&
        (isBiometricAvailable
          ? (
            <ActionButton
              contentPlacement='center'
              disabled={!hashedPassword || isUnlocking || isBiometricUnlocking}
              isBusy={isUnlocking}
              onClick={onUnlock}
              style={{
                height: '44px',
                marginTop: '18px',
                width: '100%'
              }}
              text={t('Continue')}
            />)
          : (
            <GradientButton
              disabled={!hashedPassword || isUnlocking || isBiometricUnlocking}
              isBusy={isUnlocking}
              onClick={onUnlock}
              style={{
                height: '44px',
                marginTop: '18px',
                width: '100%'
              }}
              text={t('Continue')}
            />)
        )
      }
      <Typography
        color={isUnlocking || isBiometricUnlocking ? 'text.disabled' : 'primary.main'}
        onClick={isUnlocking || isBiometricUnlocking ? undefined : onForgotPassword}
        sx={{
          alignSelf: 'center',
          cursor: isUnlocking || isBiometricUnlocking ? 'default' : 'pointer',
          mt: isExtension ? '22px' : '16px',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          transition: 'all 250ms ease-out',
          width: 'fit-content'
        }}
        variant='B-1'
      >
        {t('Forgot password')}
      </Typography>
      <MySnackbar
        isError
        onClose={() => setBiometricError(undefined)}
        open={Boolean(biometricError)}
        text={biometricError || ''}
      />
    </Grid>
  );
}

function Login({ setStep }: Props): React.ReactElement {
  const isExtensionPopup = useIsExtensionPopup();

  useBackground('drops');

  return (
    <>
      {isExtensionPopup
        ? <Container disableGutters sx={{ position: 'relative' }}>
          <Header />
          <GradientBox noGradient style={{ height: '496px', m: 'auto', mt: '8px', width: '359px' }}>
            <RedGradient style={{ right: '-8%', top: '20px', zIndex: -1 }} />
            <Content setStep={setStep} />
          </GradientBox>
          <Version />
        </Container>
        : <OnboardingLayout childrenStyle={{ justifyContent: 'center', margin: '40px 0', width: '434px' }} showBread={false} showLeftColumn={false}>
          <Content setStep={setStep} />
        </OnboardingLayout>
      }
    </>
  );
}

export default Login;
