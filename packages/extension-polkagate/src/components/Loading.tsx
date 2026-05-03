// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from 'react';

import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useIsFlying, useLocalAccounts } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import useIsForgotten from '../hooks/useIsForgotten';
import { STEPS } from '../popup/passwordManagement/constants';
import ForgotPassword from '../popup/passwordManagement/ForgotPassword';
import Login from '../popup/passwordManagement/Login';
import { ALLOWED_URL_ON_RESET_PASSWORD } from '../util/constants';
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

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const isExtension = useIsExtensionPopup();
  const isFlying = useIsFlying();
  const { isExtensionLocked } = useExtensionLockContext();
  const localAccounts = useLocalAccounts();
  const isForgotten = useIsForgotten();

  const [step, setStep] = useState<number>();

  useEffect(() => {
    if (isExtensionLocked) {
      setStep(STEPS.SHOW_LOGIN);
    }
  }, [isExtensionLocked]);

  const isResettingWallet = isForgotten?.status || ALLOWED_URL_ON_RESET_PASSWORD.includes(window.location.hash.replace('#', ''));

  const requiresAuthentication = useMemo(() =>
    !isResettingWallet &&
    ((isExtensionLocked && !!localAccounts?.length) || !children || (isFlying && isExtension))
    , [isExtensionLocked, localAccounts?.length, children, isFlying, isExtension, isResettingWallet]);

  if (!requiresAuthentication) {
    return <>{children}</>;
  }

  if (isFlying && isExtension) {
    return <FlyingLogo />;
  }

  return step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION
    ? <ForgotPassword setStep={setStep} />
    : <Login setStep={setStep} />;
}
