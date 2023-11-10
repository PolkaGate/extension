// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { logoBlack, logoMotionDark, logoMotionLight, logoWhite } from '../assets/logos';
import { useTranslation } from '../hooks';
import Passwords2 from '../popup/createAccountFullScreen/components/Passwords2';
import ForgotPasswordConfirmation from '../popup/home/ForgotPasswordConfirmation';
import PButton from './PButton';
import { Password, Warning, WrongPasswordAlert } from '.';

interface Props {
  children?: React.ReactNode;
}

const MAX_WAITING_TIME = 1000; //ms
const NO_PASS_PERIOD = 6000; //ms
const MAYBE_LATER_PERIOD = 5000; //ms

const STEPS = {
  ASK_TO_SET_PASSWORD: 0,
  SET_PASSWORD: 1,
  MAYBE_LATER: 2,
  NO_LOGIN: 3,
  SHOW_LOGIN: 4,
  IN_NO_LOGIN_PERIOD: 5,
  SHOW_DELETE_ACCOUNT_CONFIRMATION: 6
};

export type LoginInfo = {
  status: 'no' | 'mayBeLater' | 'set' | 'forgot' | 'reset';
  lastLogin?: number;
  hashedPassword?: string;
  addressesToForget?: string[];
}

export const updateStorage = async (label, newInfo) => {
  try {
    // Retrieve the previous value
    const previousData = await getStorage(label);

    // Update the previous data with the new data
    const updatedData = { ...previousData, ...newInfo };

    // Set the updated data in storage
    await setStorage(label, updatedData);

    return true;
  } catch (error) {
    console.error('Error while updating data');

    return false;
  }
};

export const getStorage = (label: any) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([label], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[label]);
      }
    });
  });
};

export const setStorage = (label: any, data: any) => {
  return new Promise<boolean>((resolve, reject) => {
    chrome.storage.local.set({ [label]: data }, () => {
      if (chrome.runtime.lastError) {
        throw new Error(`${chrome.runtime.lastError}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

export function PasswordSettingAlert(): React.ReactElement {
  const { t } = useTranslation();

  return (<Grid item>
    <b>{t<string>('Remember your password well and keep it safe. ')}</b>
    {t<string>('If you forget your password, you need to reimport your accounts and make a new password. Export and store your accounts securely to avoid losing them.')}
  </Grid>
  );
}

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  const extensionViews = chrome.extension.getViews({ type: 'popup' });
  const isPopupOpenedByExtension = extensionViews.includes(window);

  const [isFlying, setIsFlying] = useState(true);
  const [permitted, setPermitted] = useState(false);
  const [savedHashPassword, setSavedHashedPassword] = useState<string>();
  const [step, setStep] = useState<number>();
  const [password, setPassword] = useState<string>('');
  const [isPasswordError, setIsPasswordError] = useState(false);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsFlying(false);
    }, MAX_WAITING_TIME);

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []);

  useEffect(() => {
    const handleInitLoginInfo = async () => {
      const info = await getStorage('loginInfo') as LoginInfo;

      if (!info?.status || info?.status === 'reset') {
        setStep(STEPS.ASK_TO_SET_PASSWORD);
      } else if (info.status === 'mayBeLater') {
        if (info.lastLogin && Date.now() > (info.lastLogin + MAYBE_LATER_PERIOD)) {
          setStep(STEPS.ASK_TO_SET_PASSWORD);
        } else {
          setStep(STEPS.MAYBE_LATER);
          setPermitted(true);
        }
      } else if (info.status === 'no') {
        setStep(STEPS.NO_LOGIN);
        setPermitted(true);
      } else {
        if (info.lastLogin && (Date.now() > (info.lastLogin + NO_PASS_PERIOD))) {
          setStep(STEPS.SHOW_LOGIN);
          setSavedHashedPassword(info.hashedPassword as string);
        } else {
          setStep(STEPS.IN_NO_LOGIN_PERIOD);
          setPermitted(true);
        }
      }
    };

    handleInitLoginInfo().catch(console.error);
  }, []);

  const onMayBeLater = useCallback(() => {
    setPermitted(true);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setStorage('loginInfo', { lastLogin: Date.now(), status: 'mayBeLater' });
  }, []);

  const onNoPassword = useCallback(() => {
    setPermitted(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setStorage('loginInfo', { status: 'no' });
  }, []);

  const onYesToSetPassword = useCallback(() => {
    setStep(STEPS.SET_PASSWORD);
  }, []);

  const onSetPassword = useCallback(async () => {
    const hashedPassword = blake2AsHex(password, 256); // Hash the string with a 256-bit output

    await setStorage('loginInfo', { hashedPassword, lastLogin: Date.now(), status: 'set' });
    setSavedHashedPassword(hashedPassword);
    setStep(STEPS.SHOW_LOGIN);
  }, [password]);

  const onPassChange = useCallback((pass: string | null): void => {
    setIsPasswordError(false);
    setPassword(pass || '');
  }, []);

  const onCheckPassword = useCallback(async (): Promise<void> => {
    try {
      const hashedPassword = blake2AsHex(password || '', 256);

      if (savedHashPassword === hashedPassword) {
        const _info = { hashedPassword, lastLogin: Date.now(), status: 'set' };

        await setStorage('loginInfo', _info);
        setPermitted(true);
      } else {
        setIsPasswordError(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [password, savedHashPassword]);

  const onForgotPassword = useCallback(async (): Promise<void> => {
    setStep(STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION);
  }, []);

  const onConfirmForgotPassword = useCallback(async (): Promise<void> => {
    await updateStorage('loginInfo', { status: 'forgot' });
    setPermitted(true);
  }, []);

  const onRejectForgotPassword = useCallback(async (): Promise<void> => {
    setStep(STEPS.SHOW_LOGIN);
  }, []);

  return (
    <>
      {isPasswordError &&
        <WrongPasswordAlert bgcolor={theme.palette.mode === 'dark' ? 'black' : 'white'} />
      }
      {step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION &&
        <ForgotPasswordConfirmation
          onConfirmForgotPassword={onConfirmForgotPassword}
          onRejectForgotPassword={onRejectForgotPassword}
        />
      }
      {step === STEPS.SET_PASSWORD &&
        <Grid container sx={{ bgColor: theme.palette.mode === 'dark' ? 'black' : 'white', position: 'absolute', top: '30px' }}>
          <Warning
            fontWeight={300}
            theme={theme}
          >
            <PasswordSettingAlert />
          </Warning>
        </Grid>
      }
      {
        (!permitted || !children || isFlying) && isPopupOpenedByExtension
          ? <Grid alignContent='center' alignItems='center' container sx={{ bgcolor: theme.palette.mode === 'dark' ? 'black' : 'white', height: '100%', pt: '150px', pb: '250px' }}>
            {isFlying
              ? <Box
                component='img'
                src={theme.palette.mode === 'dark' ? logoMotionDark as string : logoMotionLight as string}
                sx={{ height: 'fit-content', width: '100%' }}
              />
              : <Grid container item justifyContent='center' mt='33px' my='35px'>
                <Box
                  component='img'
                  src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
                  sx={{ height: 'fit-content', width: '37%' }}
                />
              </Grid>
            }
            {!isFlying && step === STEPS.ASK_TO_SET_PASSWORD &&
              <Grid container justifyContent='center'>
                <Typography fontSize={16} pb='25px'>
                  {t('Would you like to create a password now?')}
                </Typography>
                <PButton
                  _ml={0}
                  _mt='10px'
                  _onClick={onYesToSetPassword}
                  text={t('Yes')}
                />
                <PButton
                  _ml={0}
                  _mt='10px'
                  _onClick={onMayBeLater}
                  _variant='outlined'
                  text={t('Maybe later')}
                />
                <PButton
                  _ml={0}
                  _mt='10px'
                  _onClick={onNoPassword}
                  _variant='text'
                  text={t('No')}
                />
              </Grid>
            }
            {step === STEPS.SET_PASSWORD &&
              <Grid container justifyContent='center' sx={{ display: 'block', px: '10%' }}>
                <Passwords2
                  firstPassStyle={{ marginBlock: '8px' }}
                  isFocussed
                  label={t<string>('Password')}
                  onChange={onPassChange}
                  onEnter={onSetPassword}
                />
                <PButton
                  _ml={0}
                  _mt='20px'
                  _variant='outlined'
                  _onClick={() => setStep(STEPS.ASK_TO_SET_PASSWORD)}
                  _width={45}
                  text={t('Cancel')}
                />
                <PButton
                  _ml={10}
                  _mt='20px'
                  _onClick={onSetPassword}
                  _width={45}
                  text={t('Set')}
                />
              </Grid>
            }
            {!isFlying && step === STEPS.SHOW_LOGIN &&
              <Grid container justifyContent='center' sx={{ display: 'block', px: '10%' }}>
                <Typography fontSize={16}>
                  {t('Please enter your password to proceed.')}
                </Typography>
                <Password
                  isFocused={true}
                  onChange={onPassChange}
                  onEnter={onCheckPassword}
                  style={{ marginBottom: '5px', marginTop: '5px' }}
                />
                <PButton
                  _ml={0}
                  _mt='20px'
                  _onClick={onCheckPassword}
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
            }
          </Grid>
          : children
      }
    </>
  );
}