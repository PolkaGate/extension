// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-misused-promises */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import useCheckMasterPassword from '@polkadot/extension-polkagate/src/hooks/useCheckMasterPassword';
import { unlockAllAccounts, windowOpen } from '@polkadot/extension-polkagate/src/messaging';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { blake2AsHex } from '@polkadot/util-crypto';

import { Box as BoxIcon } from '../../assets/icons';
import { DecisionButtons, GradientBox, MySwitch, PasswordInput } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { openOrFocusTab } from '../../fullscreen/accountDetails/components/CommonTasks';
import { useAutoLockPeriod, useBackground, useIsExtensionPopup, useIsHideNumbers, useIsPasswordMigrated, useTranslation } from '../../hooks';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { isPasswordCorrect } from '../settings/extensionSettings/ManagePassword';
import { STEPS } from './constants';
import Header from './Header';
import { LOGIN_STATUS } from './types';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function Content ({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isExtension = useIsExtensionPopup();
  const isPasswordMigrated = useIsPasswordMigrated();
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();
  const { setExtensionLock } = useExtensionLockContext();
  const autoLockPeriod = useAutoLockPeriod();
  const isUnlockingRef = useRef(false);

  const [hashedPassword, setHashedPassword] = useState<string>();
  const [plainPassword, setPlainPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isUnlocking, setUnlocking] = useState(false);

  const { accountsNeedMigration, hasLocalAccounts } = useCheckMasterPassword((isUnlocking && isPasswordMigrated === false) ? plainPassword : undefined);

  const onPassChange = useCallback((pass: string | null): void => {
    if (!pass) {
      return setHashedPassword(undefined);
    }

    setPlainPassword(pass);
    setIsPasswordError(false);
    const hashedPassword = blake2AsHex(pass, 256); // Hash the string with a 256-bit output

    setHashedPassword(hashedPassword);
  }, []);

  useEffect(() => {
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

    (async () => {
      try {
        const isOldPasswordCorrect = hashedPassword && await isPasswordCorrect(hashedPassword, true); // DEPRECATED, will be removed in future releases

        if (isPasswordMigrated || (isOldPasswordCorrect && accountsNeedMigration?.length === 0)) { // has master password or no need to migrate
          const success = await unlockAllAccounts(plainPassword, autoLockPeriod);

          if (success) {
            setExtensionLock(false);
            hasLocalAccounts && setStorage(STORAGE_KEY.IS_PASSWORD_MIGRATED, true) as unknown as void;
            setStorage(STORAGE_KEY.IS_FORGOTTEN, undefined) as unknown as void;
          } else {
            setExtensionLock(true);
            setIsPasswordError(true);
          }

          setPlainPassword(undefined);
        } else if (accountsNeedMigration?.length && isOldPasswordCorrect) { // needs migration
          await updateStorage(STORAGE_KEY.LOGIN_INFO, { lastLoginTime: Date.now(), status: LOGIN_STATUS.SET }); // DEPRECATED, will be removed in future releases
          setStorage(STORAGE_KEY.IS_FORGOTTEN, undefined) as unknown as void;
          setHashedPassword(undefined);
          setExtensionLock(false);
          const path = '/migratePasswords';

          isExtension
            ? windowOpen(path).catch(console.error)
            : navigate(path) as void;
        } else { // not migrated and old password is incorrect
          setIsPasswordError(true);
        }
      } catch (e) {
        console.error(e);
        setIsPasswordError(true);
      } finally {
        setUnlocking(false);

        isUnlockingRef.current = false; // ✅ unlock finished
      }
    })().catch(console.error);
  }, [accountsNeedMigration, autoLockPeriod, hasLocalAccounts, hashedPassword, isExtension, isPasswordMigrated, isUnlocking, navigate, plainPassword, setExtensionLock]);

  const onUnlock = useCallback(() => {
    if (!plainPassword || autoLockPeriod === undefined || isPasswordMigrated === undefined) {
      return;
    }

    setUnlocking(true);
  }, [autoLockPeriod, isPasswordMigrated, plainPassword]);

  const onForgotPassword = useCallback((): void => {
    if (isExtension) {
      return setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);
    }

    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION_FS);
    openOrFocusTab('/forgot-password', true);
  }, [isExtension, setStep]);

  return (
    <Grid container item justifyContent='start' sx={{ p: '18px 32px 32px' }}>
      <Box
        component='img'
        src={BoxIcon as string}
        sx={{ height: '145px', m: '17px auto 7px', width: '140px' }}
      />
      <Typography sx={{ mb: '15px', textAlign: 'center', width: '100%' }} textTransform='uppercase' variant='H-2'>
        {t('login')}
      </Typography>
      <PasswordInput
        focused
        hasError={isPasswordError}
        onEnterPress={onUnlock}
        onPassChange={onPassChange}
        title={t('Enter your password')}
      />
      <MySwitch
        checked={isHideNumbers}
        columnGap='8px'
        label={t('Hide Balance')}
        onChange={toggleHideNumbers}
        showHidden
        style={{ marginTop: '20px' }}
      />
      <DecisionButtons
        cancelButton
        direction='vertical'
        disabled={!hashedPassword}
        isBusy={isUnlocking}
        onPrimaryClick={onUnlock}
        onSecondaryClick={onForgotPassword}
        primaryBtnText={t('Unlock')}
        secondaryBtnText={t('Forgot password')}
        style={{
          height: '44px',
          marginTop: '80px',
          width: '100%'
        }}
      />
    </Grid>
  );
}

function Login ({ setStep }: Props): React.ReactElement {
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
