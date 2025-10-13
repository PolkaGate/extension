// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type Dispatch, type SetStateAction,useEffect, useState } from 'react';

import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { STEPS } from '../popup/passwordManagement/constants';
import { LOGIN_STATUS, type LoginInfo } from '../popup/passwordManagement/types';
import { getStorage, setStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';
import useAutoLockPeriod from './useAutoLockPeriod';

export default function useLoginInfo (): { step: number | undefined, setStep: Dispatch<SetStateAction<number | undefined>>, isExtensionLocked: boolean } {
  const autoLockPeriod = useAutoLockPeriod();
  const { isExtensionLocked, setExtensionLock } = useExtensionLockContext();
  const [step, setStep] = useState<number>();

  useEffect(() => {
    if (step === STEPS.IN_NO_LOGIN_PERIOD && isExtensionLocked) {
      // The extension has been locked by the user through the settings menu.
      setStep(STEPS.SHOW_LOGIN);
    }
  }, [isExtensionLocked, step]);

  useEffect(() => {
    const handleInitLoginInfo = async () => {
      if (autoLockPeriod === undefined) {
        return;
      }

      const { lastLoginTime, status } = await getStorage(STORAGE_KEY.LOGIN_INFO) as LoginInfo || {};

      if (!status) {
        /** To not asking for password setting for the onboarding time */
        setStorage(STORAGE_KEY.LOGIN_INFO, { lastLoginTime: Date.now(), status: LOGIN_STATUS.MAYBE_LATER }).catch(console.error);

        return setExtensionLock(false);
      }

      if ([LOGIN_STATUS.MAYBE_LATER, LOGIN_STATUS.RESET].includes(status)) {
        return setStep(STEPS.ASK_TO_SET_PASSWORD);
      }

      if ([LOGIN_STATUS.FORGOT, LOGIN_STATUS.JUST_SET].includes(status)) {
        return setStep(STEPS.SHOW_LOGIN);
      }

      if (status === LOGIN_STATUS.SET) {
        const isLoginPeriodExpired = lastLoginTime && (Date.now() > (lastLoginTime + autoLockPeriod));

        if (isLoginPeriodExpired) {
          setStep(STEPS.SHOW_LOGIN);
        } else {
          setStep(STEPS.IN_NO_LOGIN_PERIOD);
          setExtensionLock(false);
        }
      }
    };

    handleInitLoginInfo().catch(console.error);
  }, [autoLockPeriod, setExtensionLock]);

  return { isExtensionLocked, setStep, step };
}
