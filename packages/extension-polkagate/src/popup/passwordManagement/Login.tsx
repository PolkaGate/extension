// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { noop } from '@polkadot/util';

import { Password, PButton, WrongPasswordAlert } from '../../components';
import HideBalance from '../../components/SVG/HideBalance';
import { openOrFocusTab } from '../../fullscreen/accountDetails/components/CommonTasks';
import { useIsExtensionPopup, useIsHideNumbers, useTranslation } from '../../hooks';
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

  const isPopup = useIsExtensionPopup();
  const { isHideNumbers, toggleHideNumbers } = useIsHideNumbers();

  const onForgotPassword = useCallback((): void => {
    if (isPopup) {
      return setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);
    }

    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION_FS);
    openOrFocusTab('/forgot-password', true);
  }, [isPopup, setStep]);

  return (
    <>
      <Grid container sx={{ my: '10px' }}>
        <Grid alignItems='center' direction='column' item onClick={toggleHideNumbers} sx={{ '&:hover': { opacity: 1 }, cursor: 'pointer', display: 'flex', opacity: 0.5, position: 'absolute', pt: '3px', right: '35px', top: '15px' }}>
          <HideBalance
            hide={isHideNumbers}
            lightColor={theme.palette.secondary.light}
            onClick={noop}
            size={25}
          />
          <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500, userSelect: 'none' }}>
            {isHideNumbers ? t('Show numbers') : t('Hide numbers')}
          </Typography>
        </Grid>
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
