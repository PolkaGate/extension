// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';

import { HideIcon, Password, PButton, ShowIcon, WrongPasswordAlert } from '../../components';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import { STEPS } from './constants';

interface Props {
  isPasswordError: boolean;
  onPassChange: (pass: string | null) => void;
  onUnlock: () => Promise<void>;
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>
}

function Login ({ isPasswordError, onPassChange, onUnlock, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPopup = useIsExtensionPopup();

  const [hideNumbers, setHideNumbers] = useState<boolean>();

  const onForgotPassword = useCallback((): void => {
    if (isPopup) {
      return setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);
    }

    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION_FS);
    openOrFocusTab('/forgot-password', true);
  }, [isPopup, setStep]);

  useEffect(() => {
    const isHide = window.localStorage.getItem('hide_numbers');

    isHide === 'false' || isHide === null ? setHideNumbers(false) : setHideNumbers(true);
  }, [setHideNumbers]);

  const onHideClick = useCallback(() => {
    setHideNumbers && setHideNumbers(!hideNumbers);
    window.localStorage.setItem('hide_numbers', hideNumbers ? 'false' : 'true');
  }, [hideNumbers, setHideNumbers]);

  return (
    <>
      <Grid container sx={{ my: '10px' }}>
        <Grid alignItems='center' direction='column' item onClick={onHideClick} sx={{ cursor: 'pointer', display: 'flex', position: 'absolute', pt: '3px', right: '35px', top: '15px', opacity: 0.5, '&:hover': { opacity: 1 } }}>
          {hideNumbers
            ? <ShowIcon />
            : <HideIcon />
          }
          <Typography sx={{ color: 'secondary.light', fontSize: '12px', fontWeight: 500 }}>
            {hideNumbers ? t('Show numbers') : t('Hide numbers')}
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
