// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import useTranslation from '../../hooks/useTranslation';
import { STEPS } from './constants';
import Header from './Header';
import { BackWithLabel, Checkbox2, DecisionButtons, GlowCheckbox, GradientBox } from '../../components';
import { RedGradient } from '../../style';
import { Version } from '../../partials';
import { Warning2 } from 'iconsax-react';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

export default function ForgotPasswordConfirmation({ setStep }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setExtensionLock } = useExtensionLockContext();

  const [acknowledged, setAcknowledge] = useState<boolean>(false);

  const onConfirmForgotPassword = useCallback(async (): Promise<void> => {
    await updateStorage('loginInfo', { status: 'forgot' });
    setExtensionLock(false);
  }, [setExtensionLock]);

  const toggleAcknowledge = useCallback((state: boolean) => {
    setAcknowledge(state);
  }, []);

  const onClose = useCallback(() => {
    setStep(STEPS.SHOW_LOGIN);
  }, [setStep]);

  const _onConfirmForgotPassword = useCallback(() => {
    onConfirmForgotPassword().catch(console.error);
  }, [onConfirmForgotPassword]);

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
          <Typography fontFamily='OdibeeSans' fontSize='29px' fontWeight={400} sx={{ lineHeight: '32px', mb: '15px', mt: '10px', width: '100%' }} textAlign='center' textTransform='uppercase'>
            {t('Are you sure you want to proceed?')}
          </Typography>
          <Typography fontFamily='Inter' fontSize='12px' fontWeight={500} sx={{ color: 'text.secondary', width: '100%' }} textAlign='center'>
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
            onPrimaryClick={_onConfirmForgotPassword}
            onSecondaryClick={onClose}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Cancel')}
          />
        </Grid>
      </GradientBox>
      <Version />
    </Container>
    // <Popup show={show}>
    //   <Header
    //     onClose={onClose}
    //     text={t('Forgot Password')}
    //   />
    //   <Grid container direction='column' px='15px'>
    //     <Grid container direction='column' item justifyContent='center' pb='20px' pt='50px'>
    //       <Grid item textAlign='center'>
    //         <FontAwesomeIcon
    //           color={theme.palette.warning.main}
    //           icon={faExclamationTriangle}
    //           size='3x'
    //         />
    //       </Grid>
    //       <Grid item textAlign='center'>
    //         <Typography fontSize='16px' fontWeight={400} sx={{ color: 'warning.main' }}>
    //           {t('Are you sure you want to proceed?')}
    //         </Typography>
    //       </Grid>
    //       <Typography fontSize='16px' fontWeight={400} mt='25px' px='15px'>
    //         {t('This action will permanently delete your account(s), and password recovery will not be possible. You can reset your wallet by importing from a backup (JSON file or recovery phrase). ')}
    //       </Typography>
    //     </Grid>
    //     <Checkbox2
    //       checked={isChecked}
    //       label={t('I acknowledge permanent account(s) deletion.')}
    //       labelStyle={{ fontSize: '14px' }}
    //       onChange={onCheckChange}
    //       style={{ bottom: 75, pl: '5px', position: 'absolute' }}
    //     />
    //   </Grid>
    //   <TwoButtons
    //     disabled={!isChecked}
    //     onPrimaryClick={_onConfirmForgotPassword}
    //     onSecondaryClick={onClose}
    //     primaryBtnText={t('Proceed')}
    //     secondaryBtnText={t('Cancel')}
    //   />
    // </Popup>
  );
}
