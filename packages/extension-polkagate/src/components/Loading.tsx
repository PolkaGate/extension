// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Theme } from '@mui/material';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { logoBlack, logoMotionDark, logoMotionLight, logoWhite } from '../assets/logos';
import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useManifest } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import { isPasswordCorrect } from '../popup/passwordManagement';
import AskToSetPassword from '../popup/passwordManagement/AskToSetPassword';
import { STEPS } from '../popup/passwordManagement/constants';
import FirstTimeSetPassword from '../popup/passwordManagement/FirstTimeSetPassword';
import ForgotPasswordConfirmation from '../popup/passwordManagement/ForgotPasswordConfirmation';
import Login from '../popup/passwordManagement/Login';
import PasswordSettingAlert from '../popup/passwordManagement/PasswordSettingAlert';
import NeedHelp from '../popup/welcome/NeedHelp';
import { ALLOWED_URL_ON_RESET_PASSWORD, MAYBE_LATER_PERIOD, NO_PASS_PERIOD } from '../util/constants';

interface Props {
  children?: React.ReactNode;
}

export interface LoginInfo {
  status: 'noLogin' | 'mayBeLater' | 'justSet' | 'set' | 'forgot' | 'reset';
  lastLoginTime?: number;
  hashedPassword?: string;
  addressesToForget?: string[];
}

export const updateStorage = async (label: string, newInfo: object) => {
  try {
    // Retrieve the previous value
    const previousData = await getStorage(label) as object;

    // Update the previous data with the new data
    const updatedData = { ...previousData, ...newInfo } as unknown;

    // Set the updated data in storage
    await setStorage(label, updatedData);

    return true;
  } catch (error) {
    console.error('Error while updating data', error);

    return false;
  }
};

export const getStorage = (label: string, parse = false): Promise<object | string> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([label], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(parse ? JSON.parse((result[label] || '{}') as string) as object : result[label] as object);
      }
    });
  });
};

export const watchStorage = (label: string, setChanges: (value: any) => void, parse = false) => {
  // eslint-disable-next-line no-undef
  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: 'sync' | 'local' | 'managed' | 'session') => {
    if (areaName === 'local' && label in changes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const change = changes[label];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const newValue = change.newValue; // This is optional, so handle accordingly

      setChanges(parse ? JSON.parse((newValue || '{}') as string) : newValue);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return an unsubscribe function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};

export const setStorage = (label: string, data: unknown, stringify = false) => {
  return new Promise<boolean>((resolve) => {
    const _data = stringify ? JSON.stringify(data) : data;

    chrome.storage.local.set({ [label]: _data }, () => {
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

  const { isExtensionLocked, setExtensionLock } = useExtensionLockContext();
  const isPopupOpenedByExtension = useIsExtensionPopup();

  const [isFlying, setIsFlying] = useState(true);
  const [step, setStep] = useState<number>();
  const [hashedPassword, setHashedPassword] = useState<string>();
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
    !isPopupOpenedByExtension && setIsFlying(false);
  }, [isPopupOpenedByExtension]);

  useEffect(() => {
    const handleInitLoginInfo = async () => {
      const info = await getStorage('loginInfo') as LoginInfo;

      if (!info?.status) {
        /** To not asking for password setting for the onboarding time */
        setStorage('loginInfo', { lastLoginTime: Date.now(), status: 'mayBeLater' }).catch(console.error);

        return setExtensionLock(false);
      }

      if (info?.status === 'reset') {
        return setStep(STEPS.ASK_TO_SET_PASSWORD);
      }

      if (info.status === 'mayBeLater') {
        if (info.lastLoginTime && Date.now() > (info.lastLoginTime + MAYBE_LATER_PERIOD)) {
          setStep(STEPS.ASK_TO_SET_PASSWORD);
        } else {
          setStep(STEPS.MAYBE_LATER);
          setExtensionLock(false);
        }

        return;
      }

      if (info.status === 'noLogin') {
        setStep(STEPS.NO_LOGIN);

        return setExtensionLock(false);
      }

      if (info.status === 'justSet') {
        return setStep(STEPS.SHOW_LOGIN);
      }

      if (info.status === 'set') {
        if (info.lastLoginTime && (Date.now() > (info.lastLoginTime + NO_PASS_PERIOD))) {
          setStep(STEPS.SHOW_LOGIN);
        } else {
          setStep(STEPS.IN_NO_LOGIN_PERIOD);
          setExtensionLock(false);
        }

        return;
      }

      if (info.status === 'forgot') {
        setStep(STEPS.SHOW_LOGIN);
      }
    };

    handleInitLoginInfo().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === STEPS.IN_NO_LOGIN_PERIOD && isExtensionLocked) {
      // The extension has been locked by the user through the settings menu.
      setStep(STEPS.SHOW_LOGIN);
    }
  }, [isExtensionLocked, step]);

  const onPassChange = useCallback((pass: string | null): void => {
    if (!pass) {
      return setHashedPassword(undefined);
    }

    setIsPasswordError(false);
    const hashedPassword = blake2AsHex(pass, 256); // Hash the string with a 256-bit output

    setHashedPassword(hashedPassword);
  }, []);

  const onUnlock = useCallback(async (): Promise<void> => {
    try {
      if (hashedPassword && await isPasswordCorrect(hashedPassword, true)) {
        await updateStorage('loginInfo', { lastLoginTime: Date.now(), status: 'set' });
        setHashedPassword(undefined);
        setExtensionLock(false);
      } else {
        setIsPasswordError(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [hashedPassword, setExtensionLock]);

  const showLoginPage = useMemo(() => {
    const extensionUrl = window.location.hash.replace('#', '');

    const condition = isExtensionLocked || !children || isFlying;

    return isPopupOpenedByExtension
      ? condition
      : step === STEPS.SHOW_LOGIN && ALLOWED_URL_ON_RESET_PASSWORD.includes(extensionUrl)
        ? false
        : condition;
  }, [children, isExtensionLocked, isFlying, isPopupOpenedByExtension, step]);

  return (
    <>
      {showLoginPage
        ? <Grid container item sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white', height: window.innerHeight }}>
          {step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION &&
            <ForgotPasswordConfirmation
              setStep={setStep}
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
            {isFlying && isPopupOpenedByExtension
              ? <FlyingLogo theme={theme} />
              : <>
                {step !== undefined && ([STEPS.ASK_TO_SET_PASSWORD, STEPS.SHOW_LOGIN].includes(step)) &&
                  <Grid container item justifyContent='center' mt='33px' my='35px'>
                    <StillLogo theme={theme} />
                  </Grid>
                }
                {step === STEPS.ASK_TO_SET_PASSWORD &&
                  <AskToSetPassword
                    setStep={setStep}
                  />
                }
                {step === STEPS.SET_PASSWORD &&
                  <FirstTimeSetPassword
                    hashedPassword={hashedPassword}
                    onPassChange={onPassChange}
                    setHashedPassword={setHashedPassword}
                    setStep={setStep}
                  />
                }
                {step !== undefined && [STEPS.SHOW_LOGIN].includes(step) &&
                  <Login
                    isPasswordError={isPasswordError}
                    onPassChange={onPassChange}
                    onUnlock={onUnlock}
                    setStep={setStep}
                  />
                }
                <Grid alignItems='flex-end' container item justifyContent='space-between' sx={{ bottom: '5px', position: 'absolute', px: '20px' }}>
                  <NeedHelp />
                  <Typography sx={{ fontSize: '10px', opacity: '0.7' }}>
                    {`${('V')}${(manifest?.version || '')}`}
                  </Typography>
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
