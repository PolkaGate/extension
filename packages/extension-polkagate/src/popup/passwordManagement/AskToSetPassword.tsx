// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Box as BoxIcon } from '../../assets/icons';
import { ActionButton, GradientBox, GradientButton, NeonButton } from '../../components';
import { setStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useTranslation } from '../../hooks';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { STEPS } from './constants';
import Header from './Header';

interface Props {
  setStep: (value: React.SetStateAction<number | undefined>) => void;
}

function AskToSetPassword ({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();

  const onMayBeLater = useCallback(() => {
    setExtensionLock(false);

    setStorage('loginInfo', { lastLoginTime: Date.now(), status: 'mayBeLater' }).catch(console.error);
  }, [setExtensionLock]);

  const onNoPassword = useCallback(() => {
    setExtensionLock(false);
    setStorage('loginInfo', { status: 'noLogin' }).catch(console.error);
  }, [setExtensionLock]);

  const onYesToSetPassword = useCallback(() => {
    setStep(STEPS.SET_PASSWORD);
  }, [setStep]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <GradientBox noGradient style={{ m: 'auto', mt: '8px', width: '359px' }}>
        <RedGradient style={{ right: '-8%', top: '20px' }} />
        <Grid container item justifyContent='center' sx={{ p: '18px 32px 32px' }}>
          <Box
            component='img'
            src={BoxIcon as string}
            sx={{ height: '145px', mt: '20px', width: '140px' }}
          />
          <Typography fontFamily='OdibeeSans' fontSize='29px' fontWeight={400} sx={{ mb: '6px', mt: '25px', width: '100%' }} textAlign='center' textTransform='uppercase'>
            {t('welcome')}!
          </Typography>
          <Typography fontFamily='Inter' fontSize='13px' fontWeight={500} sx={{ color: 'text.secondary', width: '100%' }} textAlign='center'>
            {t('Would you like to set a login password?')}
          </Typography>
          <GradientButton
            onClick={onYesToSetPassword}
            style={{
              height: '48px',
              marginTop: '24px',
              width: '325px'
            }}
            text={t('Yes')}
          />
          <ActionButton
            contentPlacement='center'
            onClick={onMayBeLater}
            style={{
              height: '46px',
              marginTop: '15px',
              width: '325px'
            }}
            text={{ firstPart: t('Later') }}
          />
          <NeonButton
            contentPlacement='center'
            onClick={onNoPassword}
            style={{
              height: '44px',
              marginTop: '15px',
              width: '325px'
            }}
            text={t('No')}
          />
        </Grid>
      </GradientBox>
      <Version />
    </Container>
  );
}

export default AskToSetPassword;
