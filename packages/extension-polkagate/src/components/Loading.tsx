// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useAutoLockPeriod } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import AskToSetPassword from '../popup/passwordManagement/AskToSetPassword';
import { STEPS } from '../popup/passwordManagement/constants';
import FirstTimeSetPassword from '../popup/passwordManagement/FirstTimeSetPassword';
import ForgotPasswordConfirmation from '../popup/passwordManagement/ForgotPasswordConfirmation';
import Login from '../popup/passwordManagement/Login';
import { ALLOWED_URL_ON_RESET_PASSWORD, MAYBE_LATER_PERIOD } from '../util/constants';
import FlyingLogo from './FlyingLogo';

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

const MAX_WAITING_TIME = 1500; // ms

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const autoLockPeriod = useAutoLockPeriod();
  const isPopupOpenedByExtension = useIsExtensionPopup();

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
    !isPopupOpenedByExtension && setIsFlying(false);
  }, [isPopupOpenedByExtension]);

  useEffect(() => {
    const handleInitLoginInfo = async () => {
      if (autoLockPeriod === undefined) {
        return;
      }

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
        if (info.lastLoginTime && (Date.now() > (info.lastLoginTime + autoLockPeriod))) {
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
  }, [autoLockPeriod]);

  useEffect(() => {
    if (step === STEPS.IN_NO_LOGIN_PERIOD && isExtensionLocked) {
      // The extension has been locked by the user through the settings menu.
      setStep(STEPS.SHOW_LOGIN);
    }
  }, [isExtensionLocked, step]);

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
        ? <Grid container item>
          {step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION &&
            <ForgotPasswordConfirmation
              setStep={setStep}
            />
          }
          <Grid container item>
            {isFlying && isPopupOpenedByExtension
              ? <FlyingLogo />
              : <>
                {step === STEPS.ASK_TO_SET_PASSWORD &&
                  <AskToSetPassword
                    setStep={setStep}
                  />
                }
                {step === STEPS.SET_PASSWORD &&
                  <FirstTimeSetPassword
                    setStep={setStep}
                  />
                }
                {step !== undefined && [STEPS.SHOW_LOGIN].includes(step) &&
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
