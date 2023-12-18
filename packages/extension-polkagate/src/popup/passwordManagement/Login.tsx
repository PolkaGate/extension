// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { Password, PButton, WrongPasswordAlert } from '../../components';
import { useTranslation } from '../../hooks';
import { STEPS } from './constants';

interface Props {
  isPasswordError: boolean;
  onPassChange: (pass: string | null) => void;
  onUnlock: () => Promise<void>;
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function Login({ isPasswordError, onPassChange, onUnlock, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const onForgotPassword = useCallback((): void => {
    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);
  }, [setStep]);

  return (
    <>
      <Grid container sx={{ height: '30px' }}>
        {isPasswordError &&
          <WrongPasswordAlert bgcolor={theme.palette.mode === 'dark' ? 'black' : 'white'} />
        }
      </Grid>
      <Grid container justifyContent='center' sx={{ display: 'block', px: '10%' }}>
        <Typography fontSize={16}>
          {t('Please enter your password to proceed.')}
        </Typography>
        <Password
          isFocused={true}
          onChange={onPassChange}
          onEnter={onUnlock}
          style={{ marginBottom: '5px', marginTop: '5px' }}
        />
        <PButton
          _ml={0}
          _mt='20px'
          _onClick={onUnlock}
          _width={100}
          text={t('Unlock')}
        />
        <PButton
          _ml={0}
          _mt='10px'
          _onClick={onForgotPassword}
          _variant='text'
          _width={100}
          text={t('Forgot password?')}
        />
      </Grid>
    </>
  );
}

export default Login;
