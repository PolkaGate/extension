// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { logoBlack, logoMotionDark, logoMotionLight, logoWhite } from '../assets/logos';
import { useManifest, useTranslation } from '../hooks';
import ForgotPasswordConfirmation from '../popup/home/ForgotPasswordConfirmation';
import AskToSetPassword from '../popup/passwordManagement/AskToSetPassword';
import FirstTimeSetPassword from '../popup/passwordManagement/FirstTimeSetPassword';
import PasswordSettingAlert from '../popup/passwordManagement/PasswordSettingAlert';
import ShowLogin from '../popup/passwordManagement/ShowLogin';
import { MAYBE_LATER_PERIOD, NO_PASS_PERIOD } from '../util/constants';
import { STEPS } from '../popup/passwordManagement/constants';

interface Props {
  children?: React.ReactNode;
}

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

export const setStorage = (label: unknown, data: any) => {
  return new Promise<boolean>((resolve) => {
    chrome.storage.local.set({ [label]: data }, () => {
      if (chrome.runtime.lastError) {
        console.log('Error while setting storage:', chrome.runtime.lastError);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const MAX_WAITING_TIME = 1000; // ms

const StillLogo = ({ theme }: { theme: Theme }) => (
  <Box
    component='img'
    src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
    sx={{ height: 'fit-content', width: '37%' }}
  />
);

const FlyingLogo = ({ theme }: { theme: Theme }) => (
  <Box
    component='img'
    src={theme.palette.mode === 'dark' ? logoMotionDark as string : logoMotionLight as string}
    sx={{ height: 'fit-content', width: '100%' }}
  />
);

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const manifest = useManifest();
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

  const onConfirmForgotPassword = useCallback(async (): Promise<void> => {
    await updateStorage('loginInfo', { status: 'forgot' });
    setPermitted(true);
  }, []);

  const onRejectForgotPassword = useCallback(async (): Promise<void> => {
    setStep(STEPS.SHOW_LOGIN);
  }, []);

  return (
    <>
      {
        (!permitted || !children || isFlying) && isPopupOpenedByExtension
          ? <Grid container item sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white', height: '600px' }}>
            {step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION &&
              <ForgotPasswordConfirmation
                onConfirmForgotPassword={onConfirmForgotPassword}
                onRejectForgotPassword={onRejectForgotPassword}
              />
            }
            {step === STEPS.SET_PASSWORD &&
              <>
                <Grid container item justifyContent='center' mt='33px' my='35px'>
                  <StillLogo theme={theme} />
                </Grid>
                <Grid container sx={{ position: 'absolute', top: '165px' }}>
                  <PasswordSettingAlert />
                </Grid>
              </>
            }
            <Grid container item sx={{ p: '145px 0 70px' }}>
              {isFlying
                ? <FlyingLogo theme={theme} />
                : <>
                  {step !== STEPS.SET_PASSWORD &&
                    <Grid container item justifyContent='center' mt='33px' my='35px'>
                      <Box
                        component='img'
                        src={theme.palette.mode === 'dark' ? logoBlack as string : logoWhite as string}
                        sx={{ height: 'fit-content', width: '37%' }}
                      />
                    </Grid>
                  }
                  {step === STEPS.ASK_TO_SET_PASSWORD &&
                    <AskToSetPassword
                      setPermitted={setPermitted}
                      setStep={setStep}
                    />
                  }
                  {step === STEPS.SET_PASSWORD &&
                    <FirstTimeSetPassword
                      onPassChange={onPassChange}
                      onSetPassword={onSetPassword}
                      password={password}
                      setStep={setStep}
                    />
                  }
                  {step === STEPS.SHOW_LOGIN &&
                    <ShowLogin
                      isPasswordError={isPasswordError}
                      onCheckPassword={onCheckPassword}
                      onPassChange={onPassChange}
                      setStep={setStep}
                    />
                  }
                  <Grid container item justifyContent='center' sx={{ bottom: '10px', fontSize: '10px', position: 'absolute' }}>
                    {`${('V')}${(manifest?.version || '') as string}`}
                  </Grid>
                </>
              }
            </Grid>
          </Grid>
          : children
      }
    </>
  );
}
