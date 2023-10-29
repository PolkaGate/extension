// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { logoBlack, logoMotionDark, logoMotionLight, logoWhite } from '../assets/logos';
import { useTranslation } from '../hooks';
import Passwords2 from '../popup/createAccountFullScreen/components/Passwords2';
import PButton from './PButton';
import { Password, WrongPasswordAlert } from '.';

interface Props {
  children?: React.ReactNode;
}

const MAX_WAITING_TIME = 1000; //ms

const STEPS = {
  ASK_TO_SET_PASSWORD: 0,
  SET_PASSWORD: 1,
  NO_LOGIN: 2,
  SHOW_LOGIN: 3
}

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  const extensionViews = chrome.extension.getViews({ type: 'popup' });
  const isPopupOpenedByExtension = extensionViews.includes(window);

  const [isFlying, setIsFlying] = useState(true);
  const [Permitted, setPermitted] = useState(false);
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
    chrome.storage.local.get('savedPassword6', (res) => {
      if (!res?.savedPassword6 || res?.savedPassword6 === 'mayBeLater') {
        setStep(STEPS.ASK_TO_SET_PASSWORD);
      } else if (res.savedPassword6 === 'no') {
        setStep(STEPS.NO_LOGIN);
        setPermitted(true);
      } else {
        setStep(STEPS.SHOW_LOGIN);
        setSavedHashedPassword(res.savedPassword6 as string);
      }
    });
  }, []);

  const onMayBeLater = useCallback(() => {
    setPermitted(true);

    chrome.storage.local.set({ savedPassword6: 'mayBeLater' }).catch(console.error);
  }, []);

  const onNoPassword = useCallback(() => {
    setPermitted(true);
    chrome.storage.local.set({ savedPassword6: 'no' }).catch(console.error);
  }, []);

  const onYesToSetPassword = useCallback(() => {
    setStep(STEPS.SET_PASSWORD);
  }, []);

  const onSetPassword = useCallback(() => {
    const hashedPassword = blake2AsHex(password, 256); // Hash the string with a 256-bit output

    chrome.storage.local.set({ savedPassword6: hashedPassword }).catch(console.error);
  }, [password]);

  const onPassChange = useCallback((pass: string | null): void => {
    setIsPasswordError(false);
    setPassword(pass || '');
  }, []);

  const onCheckPassword = useCallback((): void => {
    const hashedPassword = blake2AsHex(password || '', 256); 

    if (savedHashPassword === hashedPassword) {
      setPermitted(true);
    } else {
      setIsPasswordError(true);
    }
  }, [password, savedHashPassword]);

  return (
    <>
      {isPasswordError &&
        <WrongPasswordAlert bgcolor={theme.palette.mode === 'dark' ? 'black' : 'white'} />
      }
      {
        (!Permitted || !children) && isPopupOpenedByExtension
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
                <Typography fontSize={16}>
                  {t('Would you like to create a password?')}
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
                  text={t('May be later')}
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
                  label={t<string>('Password')}
                  onChange={onPassChange}
                  // eslint-disable-next-line react/jsx-no-bind
                  onEnter={() => null}
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
            {step === STEPS.SHOW_LOGIN &&
              <Grid container justifyContent='center' sx={{ display: 'block', px: '10%' }}>
                <Typography fontSize={16}>
                  {t('Please enter your password to log in')}
                </Typography>
                <Password
                  isFocused={true}
                  onChange={onPassChange}
                  onEnter={onCheckPassword}
                  style={{ marginTop: '15px' }}
                />
                <PButton
                  _ml={0}
                  _mt='20px'
                  _onClick={onCheckPassword}
                  _width={100}
                  text={t('Enter')}
                />
              </Grid>
            }
          </Grid>
          : children
      }
    </>
  );
}
