// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { Lock as LockGif } from '../../assets/gif';
import { GradientBox, GradientButton, MatchPasswordField } from '../../components';
import { setStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { STEPS } from './constants';
import Header from './Header';
import { LOGIN_STATUS } from './types';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>;
  isFullscreen?: boolean;
}

function Content ({ isFullscreen, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();

  const [password, setPassword] = useState<string>();

  const onSetPassword = useCallback(async () => {
    if (!password) {
      return;
    }

    await setStorage(STORAGE_KEY.LOGIN_INFO, { hashedPassword: password, lastEdit: Date.now(), lastLoginTime: Date.now(), status: LOGIN_STATUS.JUST_SET });
    setExtensionLock(true);
    setStep(STEPS.SHOW_LOGIN);
  }, [password, setExtensionLock, setStep]);

  return (
    <Grid container item justifyContent='center' sx={{ p: '18px 15px 26px', position: 'relative', zIndex: 1 }}>
      <Box
        component='img'
        src={LockGif as string}
        sx={{ height: '53px', width: '53px' }}
      />
      <Typography sx={{ lineHeight: '32px', mb: '12px', mt: '20px', width: '100%' }} textTransform='uppercase' variant='H-2'>
        {t('Set a secure password')}
      </Typography>
      <Typography sx={{ color: 'text.secondary', m: isFullscreen ? '20px 0 20px' : '0 0 22px', px: '7px', width: '100%' }} variant='B-4'>
        {t('Make sure to remember this password. If you forget it, you’ll need to reimport your accounts and set a new one. To avoid losing access, export and store your accounts securely.')}
      </Typography>
      <MatchPasswordField
        focused
        hashPassword
        onSetPassword={onSetPassword}
        setConfirmedPassword={setPassword}
        style={{ marginBottom: '15px' }}
      />
      <GradientButton
        contentPlacement='center'
        disabled={!password}
        onClick={onSetPassword}
        style={{
          height: '44px',
          marginTop: isFullscreen ? '20px' : 'auto'
        }}
        text={t('Set Password')}
      />
    </Grid>
  );
}

function FirstTimeSetPassword ({ setStep }: Props): React.ReactElement {
  const isExtensionPopup = useIsExtensionPopup();

  return (
    <>
      {isExtensionPopup
        ? <Container disableGutters sx={{ position: 'relative' }}>
          <Header />
          <GradientBox noGradient style={{ m: 'auto', mt: '8px', width: '359px' }}>
            <RedGradient style={{ right: '-8%', top: '20px', zIndex: -1 }} />
            <Content setStep={setStep} />
          </GradientBox>
          <Version />
        </Container>
        : <OnboardingLayout childrenStyle={{ justifyContent: 'center', margin: 'auto', width: '434px' }} showBread={false} showLeftColumn={false}>
          <Content isFullscreen={true} setStep={setStep} />
        </OnboardingLayout>
      }
    </>

  );
}

export default FirstTimeSetPassword;
