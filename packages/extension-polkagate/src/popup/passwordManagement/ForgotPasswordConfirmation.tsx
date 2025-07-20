// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { NAMES_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

import { BackWithLabel, DecisionButtons, GlowCheckbox, GradientBox } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useBackground } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { STEPS } from './constants';
import Header from './Header';
import { LOGIN_STATUS } from './types';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

export default function ForgotPasswordConfirmation ({ setStep }: Props): React.ReactElement<Props> {
  useBackground('drops');

  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();

  const [acknowledged, setAcknowledge] = useState<boolean>(false);

  const onConfirmForgotPassword = useCallback(() => {
    updateStorage(NAMES_IN_STORAGE.LOGIN_IFO, { status: LOGIN_STATUS.FORGOT }).then(() => {
      setExtensionLock(false);
    }).catch(console.error);
  }, [setExtensionLock]);

  const toggleAcknowledge = useCallback((state: boolean) => {
    setAcknowledge(state);
  }, []);

  const onClose = useCallback(() => {
    setStep(STEPS.SHOW_LOGIN);
  }, [setStep]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <BackWithLabel
        onClick={onClose}
        text={t('Forgot password')}
      />
      <GradientBox noGradient style={{ m: 'auto', mt: '8px', width: '359px' }}>
        <RedGradient style={{ right: '-8%', top: '20px', zIndex: -1 }} />
        <Grid container item justifyContent='center' sx={{ p: '18px 22px 22px' }}>
          <Warning2 color='#FFCE4F' size='50' variant='Bold' />
          <Typography sx={{ lineHeight: '32px', mb: '15px', mt: '10px', width: '100%' }} textTransform='uppercase' variant='H-2'>
            {t('Are you sure you want to proceed?')}
          </Typography>
          <Typography sx={{ color: 'text.secondary', width: '100%' }} variant='B-4'>
            {t('This action will permanently delete your account(s), and password recovery will not be possible. You can reset your wallet by importing from a backup (JSON file or recovery phrase).')}
          </Typography>
          <GlowCheckbox
            changeState={toggleAcknowledge}
            checked={acknowledged}
            label={t('I acknowledge permanent account(s) deletion')}
            style={{ mb: '15px', mt: '130px' }}
          />
          <DecisionButtons
            cancelButton
            disabled={!acknowledged}
            divider
            onPrimaryClick={onConfirmForgotPassword}
            onSecondaryClick={onClose}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Cancel')}
          />
        </Grid>
      </GradientBox>
      <Version />
    </Container>
  );
}
