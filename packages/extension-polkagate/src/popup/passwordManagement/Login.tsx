// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { Box as BoxIcon } from '../../assets/icons';
import { ActionButton, GradientBox, GradientButton, PasswordInput } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { openOrFocusTab } from '../../fullscreen/accountDetails/components/CommonTasks';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { STEPS } from './constants';
import Header from './Header';
import { isPasswordCorrect } from '.';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function Login ({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isPopup = useIsExtensionPopup();
  // const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();
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
        await updateStorage('loginInfo', { lastLoginTime: Date.now(), status: 'set' });
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
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <GradientBox noGradient style={{ height: '496px', m: 'auto', mt: '8px', width: '359px' }}>
        <RedGradient style={{ right: '-8%', top: '20px', zIndex: -1 }} />
        <Grid container item justifyContent='center' sx={{ p: '18px 32px 32px' }}>
          <Box
            component='img'
            src={BoxIcon as string}
            sx={{ height: '145px', mt: '20px', width: '140px' }}
          />
          <Typography sx={{ mb: '15px', mt: '25px', width: '100%' }} textTransform='uppercase' variant='H-2'>
            {t('login')}
          </Typography>
          <PasswordInput
            focused
            hasError={isPasswordError}
            onEnterPress={onUnlock}
            onPassChange={onPassChange}
            title={t('Please enter your password to proceed')}
          />
          <GradientButton
            contentPlacement='center'
            disabled={!hashedPassword}
            onClick={onUnlock}
            style={{
              height: '44px',
              marginTop: '24px',
              width: '325px'
            }}
            text={t('Unlock')}
          />
          <ActionButton
            contentPlacement='center'
            onClick={onForgotPassword}
            style={{
              height: '44px',
              marginTop: '18px',
              width: '325px'
            }}
            text={ t('Forgot password')}
          />
        </Grid>
      </GradientBox>
      <Version />
    </Container>
  );
}

export default Login;
