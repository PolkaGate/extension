// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2, Header, Popup, TwoButtons } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import useTranslation from '../../hooks/useTranslation';
import { STEPS } from '../passwordManagement/constants';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

export default function ForgotPasswordConfirmation({ setStep }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setExtensionLock } = useExtensionLockContext();

  const [show, setShow] = useState<boolean>(true);
  const [isChecked, setChecked] = useState<boolean>(false);

  const onConfirmForgotPassword = useCallback(async (): Promise<void> => {
    await updateStorage('loginInfo', { status: 'forgot' });
    setExtensionLock(false);
  }, [setExtensionLock]);

  const onClose = useCallback(() => {
    setStep(STEPS.SHOW_LOGIN);
    setShow(false);
  }, [setStep]);

  const onCheckChange = useCallback(() => {
    setChecked(!isChecked);
  }, [isChecked]);

  const _onConfirmForgotPassword = useCallback(() => {
    onConfirmForgotPassword().catch(console.error);
    setShow(false);
  }, [onConfirmForgotPassword]);

  return (
    <Popup show={show}>
      <Header
        onClose={onClose}
        text={t<string>('Forgot Password')}
      />
      <Grid container direction='column' px='15px'>
        <Grid container direction='column' item justifyContent='center' pb='20px' pt='50px'>
          <Grid item textAlign='center'>
            <FontAwesomeIcon
              color={theme.palette.warning.main}
              icon={faExclamationTriangle}
              size='3x'
            />
          </Grid>
          <Grid item textAlign='center'>
            <Typography fontSize='16px' fontWeight={400} sx={{ color: 'warning.main' }}>
              {t<string>('Are you sure you want to proceed?')}
            </Typography>
          </Grid>
          <Typography fontSize='16px' fontWeight={400} mt='25px' px='15px'>
            {t<string>('This action will permanently delete your account(s), and password recovery will not be possible. You can reset your wallet by importing from a backup (JSON file or recovery phrase). ')}
          </Typography>
        </Grid>
        <Checkbox2
          checked={isChecked}
          label={t<string>('I acknowledge permanent account(s) deletion.')}
          labelStyle={{ fontSize: '14px' }}
          onChange={onCheckChange}
          style={{ bottom: 75, pl: '5px', position: 'absolute' }}
        />
      </Grid>
      <TwoButtons
        disabled={!isChecked}
        onPrimaryClick={_onConfirmForgotPassword}
        onSecondaryClick={onClose}
        primaryBtnText={t<string>('Proceed')}
        secondaryBtnText={t<string>('Cancel')}
      />
    </Popup>
  );
}
