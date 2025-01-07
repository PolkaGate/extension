// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { Lock as LockGif } from '../../assets/gif';
import { DecisionButtons, GradientBox, MatchPasswordField } from '../../components';
import { setStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useTranslation } from '../../hooks';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { STEPS } from './constants';
import Header from './Header';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function FirstTimeSetPassword ({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();

  const [password, setPassword] = useState<string>();

  const onSetPassword = useCallback(async () => {
    if (!password) {
      return;
    }

    await setStorage('loginInfo', { hashedPassword: password, lastLoginTime: Date.now(), status: 'justSet' });
    setExtensionLock(true);
    setStep(STEPS.SHOW_LOGIN);
  }, [password, setExtensionLock, setStep]);

  const onCancel = useCallback(() => {
    setStep(STEPS.ASK_TO_SET_PASSWORD);
  }, [setStep]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <GradientBox noGradient style={{ m: 'auto', mt: '8px', width: '359px' }}>
        <RedGradient style={{ right: '-8%', top: '20px', zIndex: -1 }} />
        <Grid container item justifyContent='center' sx={{ p: '18px 15px 26px' }}>
          <Box
            component='img'
            src={LockGif as string}
            sx={{ height: '53px', width: '53px' }}
          />
          <Typography fontFamily='OdibeeSans' fontSize='29px' fontWeight={400} sx={{ lineHeight: '32px', mb: '12px', mt: '20px', width: '100%' }} textAlign='center' textTransform='uppercase'>
            {t('Remember your password well and keep it safe')}
          </Typography>
          <Typography fontFamily='Inter' fontSize='12px' fontWeight={500} sx={{ color: 'text.secondary', mb: '22px', px: '7px', width: '100%' }} textAlign='center'>
            {t('If you forget your password, you need to reimport your accounts and make a new password. Export and store your accounts securely to avoid losing them')}
          </Typography>
          <MatchPasswordField
            focused
            hashPassword
            onSetPassword={onSetPassword}
            setConfirmedPassword={setPassword}
            style={{ marginBottom: '15px' }}
          />
          <DecisionButtons
            arrow
            disabled={!password}
            onPrimaryClick={onSetPassword}
            onSecondaryClick={onCancel}
            primaryBtnText={t('Set')}
            secondaryBtnText={t('Cancel')}
          />
        </Grid>
      </GradientBox>
      <Version />
    </Container>
  );
}

export default FirstTimeSetPassword;
