// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-misused-promises */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { blake2AsHex } from '@polkadot/util-crypto';

import { Box as BoxIcon } from '../../assets/icons';
import { DecisionButtons, GradientBox, MySwitch, PasswordInput } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { openOrFocusTab } from '../../fullscreen/accountDetails/components/CommonTasks';
import { useBackground, useIsExtensionPopup, useIsHideNumbers, useTranslation } from '../../hooks';
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
  const isPopup = useIsExtensionPopup();
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();
  const { setExtensionLock } = useExtensionLockContext();

  const [hashedPassword, setHashedPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState(false);

  const onPassChange = useCallback((pass: string | null): void => {
    if (!pass) {
      return setHashedPassword(undefined);
    }

    setIsPasswordError(false);
    const hashedPassword = blake2AsHex(pass, 256); // Hash the string with a 256-bit output

    setHashedPassword(hashedPassword);
  }, []);

  const onUnlock = useCallback(async (): Promise<void> => {
    try {
      if (hashedPassword && await isPasswordCorrect(hashedPassword, true)) {
        await updateStorage(STORAGE_KEY.LOGIN_INFO, { lastLoginTime: Date.now(), status: LOGIN_STATUS.SET });
        setHashedPassword(undefined);
        setExtensionLock(false);
      } else {
        setIsPasswordError(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [hashedPassword, setExtensionLock]);

  const onForgotPassword = useCallback((): void => {
    if (isPopup) {
      return setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);
    }

    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION_FS);
    openOrFocusTab('/forgot-password', true);
  }, [isPopup, setStep]);

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
