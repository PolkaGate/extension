// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, Theme, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { logoBlack, logoMotionDark, logoMotionLight, logoWhite } from '../assets/logos';
import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useManifest } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import ForgotPasswordConfirmation from '../popup/home/ForgotPasswordConfirmation';
import { isPasswordCorrect } from '../popup/passwordManagement';
import AskToSetPassword from '../popup/passwordManagement/AskToSetPassword';
import { STEPS } from '../popup/passwordManagement/constants';
import FirstTimeSetPassword from '../popup/passwordManagement/FirstTimeSetPassword';
import Login from '../popup/passwordManagement/Login';
import PasswordSettingAlert from '../popup/passwordManagement/PasswordSettingAlert';
import { MAYBE_LATER_PERIOD, NO_PASS_PERIOD } from '../util/constants';

interface Props {
  children?: React.ReactNode;
}

const ALLOWED_URL_ON_RESET_PASSWORD = ['/account/restore-json', '/account/import-seed'];

export type LoginInfo = {
  status: 'noLogin' | 'mayBeLater' | 'justSet' | 'set' | 'forgot' | 'reset';
  lastLoginTime?: number;
  hashedPassword?: string;
  addressesToForget?: string[];
}

export const updateStorage = async (label: string, newInfo: unknown) => {
  try {
    // Retrieve the previous value
    const previousData = await getStorage(label);

    // Update the previous data with the new data
    const updatedData = { ...previousData, ...newInfo } as unknown;

    // Set the updated data in storage
    await setStorage(label, updatedData);

    return true;
  } catch (error) {
    console.error('Error while updating data');

    return false;
  }
};

export const getStorage = (label: string) => {
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

export const setStorage = (label: string, data: unknown) => {
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
  const { isExtensionLocked, setExtensionLock } = useExtensionLockContext();
  const isPopupOpenedByExtension = useIsExtensionPopup();

  const [isFlying, setIsFlying] = useState(true);
  const [step, setStep] = useState<number>();
  const [hashedPassword, setHashedPassword] = useState<string>('');
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

      if (!info?.status || info?.status === 'reset') {
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
  }, [setExtensionLock]);

  const onPassChange = useCallback((pass: string | null): void => {
    setIsPasswordError(false);
    const hashedPassword = blake2AsHex(pass, 256); // Hash the string with a 256-bit output

    setHashedPassword(hashedPassword);
  }, []);

  const onUnlock = useCallback(async (): Promise<void> => {
    try {
      if (await isPasswordCorrect(hashedPassword, true)) {
        await updateStorage('loginInfo', { lastLoginTime: Date.now(), status: 'set' });
        setHashedPassword('');
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

    return isPopupOpenedByExtension
      ? isExtensionLocked || !children || isFlying
      : step === STEPS.SHOW_LOGIN && ALLOWED_URL_ON_RESET_PASSWORD.includes(extensionUrl)
        ? false
        : isExtensionLocked || !children || isFlying;
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
                {[STEPS.ASK_TO_SET_PASSWORD, STEPS.SHOW_LOGIN].includes(step) && (isPopupOpenedByExtension || isExtensionLocked) &&
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
                    setStep={setStep}
                  />
                }
                {[STEPS.SHOW_LOGIN].includes(step) &&
                  <Login
                    isPasswordError={isPasswordError}
                    onPassChange={onPassChange}
                    onUnlock={onUnlock}
                    setStep={setStep}
                  />
                }
                <Grid container item justifyContent='center' sx={{ bottom: '10px', fontSize: '10px', opacity: '0.7', position: 'absolute' }}>
                  {`${('V')}${(manifest?.version || '')}`}
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
