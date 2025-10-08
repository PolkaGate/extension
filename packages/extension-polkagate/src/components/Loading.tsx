// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useAutoLockPeriod } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import { STEPS } from '../popup/passwordManagement/constants';
import FirstTimeSetPassword from '../popup/passwordManagement/FirstTimeSetPassword';
import ForgotPassword from '../popup/passwordManagement/ForgotPassword';
import Login from '../popup/passwordManagement/Login';
import { LOGIN_STATUS, type LoginInfo } from '../popup/passwordManagement/types';
import { ALLOWED_URL_ON_RESET_PASSWORD, MAYBE_LATER_PERIOD, STORAGE_KEY } from '../util/constants';
import FlyingLogo from './FlyingLogo';

interface Props {
  children?: React.ReactNode;
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

const MAX_WAITING_TIME = 1500; // ms

export default function Loading ({ children }: Props): React.ReactElement<Props> {
  const autoLockPeriod = useAutoLockPeriod();
  const isExtension = useIsExtensionPopup();

  const { isExtensionLocked, setExtensionLock } = useExtensionLockContext();
  const [isFlying, setIsFlying] = useState(true);
  const [step, setStep] = useState<number>();

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsFlying(false);
    }, MAX_WAITING_TIME);

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []);

  useEffect(() => {
    !isExtension && setIsFlying(false);
  }, [isExtension]);

  useEffect(() => {
    const handleInitLoginInfo = async () => {
      if (autoLockPeriod === undefined) {
        return;
      }

      const info = await getStorage(STORAGE_KEY.LOGIN_INFO) as LoginInfo;

      if (!info?.status) {
        /** To not asking for password setting for the onboarding time */
        setStorage(STORAGE_KEY.LOGIN_INFO, { lastLoginTime: Date.now(), status: LOGIN_STATUS.MAYBE_LATER }).catch(console.error);

        return setExtensionLock(false);
      }

      if (info?.status === LOGIN_STATUS.RESET) {
        return setStep(STEPS.ASK_TO_SET_PASSWORD);
      }

      if (info.status === LOGIN_STATUS.MAYBE_LATER) {
        if (info.lastLoginTime && Date.now() > (info.lastLoginTime + MAYBE_LATER_PERIOD)) {
          setStep(STEPS.ASK_TO_SET_PASSWORD);
        } else {
          setStep(STEPS.MAYBE_LATER);
          setExtensionLock(false);
        }

        return;
      }

      if (info.status === LOGIN_STATUS.NO_LOGIN) {
        setStep(STEPS.NO_LOGIN);

        return setExtensionLock(false);
      }

      if (info.status === LOGIN_STATUS.JUST_SET) {
        return setStep(STEPS.SHOW_LOGIN);
      }

      if (info.status === LOGIN_STATUS.SET) {
        const isLoginPeriodExpired = info.lastLoginTime && (Date.now() > (info.lastLoginTime + autoLockPeriod));

        if (isLoginPeriodExpired) {
          setStep(STEPS.SHOW_LOGIN);
        } else {
          setStep(STEPS.IN_NO_LOGIN_PERIOD);
          setExtensionLock(false);
        }

        return;
      }

      if (info.status === LOGIN_STATUS.FORGOT) {
        setStep(STEPS.SHOW_LOGIN);
      }
    };

    handleInitLoginInfo().catch(console.error);
  }, [autoLockPeriod, setExtensionLock]);

  useEffect(() => {
    if (step === STEPS.IN_NO_LOGIN_PERIOD && isExtensionLocked) {
      // The extension has been locked by the user through the settings menu.
      setStep(STEPS.SHOW_LOGIN);
    }
  }, [isExtensionLocked, step]);

  const showLoginPage = useMemo(() => {
    const extensionUrl = window.location.hash.replace('#', '');

    const condition = isExtensionLocked || !children || isFlying;

    return isExtension
      ? condition
      : step === STEPS.SHOW_LOGIN && ALLOWED_URL_ON_RESET_PASSWORD.includes(extensionUrl)
        ? false
        : condition;
  }, [children, isExtensionLocked, isFlying, isExtension, step]);

  return (
    <>
      {
        showLoginPage
          ? <Grid container item>
            {
              step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION &&
              <ForgotPassword
                setStep={setStep}
              />
            }
            <Grid container item>
              {
                isFlying && isExtension
                  ? <FlyingLogo />
                  : <>
                    {
                      step === STEPS.ASK_TO_SET_PASSWORD &&
                      <FirstTimeSetPassword
                        setStep={setStep}
                      />
                    }
                    {
                      step === STEPS.SET_PASSWORD &&
                      <FirstTimeSetPassword
                        setStep={setStep}
                      />
                    }
                    {
                      step !== undefined && [STEPS.SHOW_LOGIN].includes(step) &&
                      <Login
                        setStep={setStep}
                      />
                    }
                  </>
              }
            </Grid>
          </Grid>
          : children
      }
    </>
  );
}
