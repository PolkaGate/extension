// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { ActionContext, Warning } from '../../components';
import { getStorage, LoginInfo, setStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import Confirmation from './Confirmation';
import { STEPS } from './constants';
import Modify from './Modify';
import SetPassword from './SetPassword';

export default function LoginPassword (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [step, setStep] = useState<number>();
  const [newPassword, setNewPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    getStorage('loginInfo').then((info: LoginInfo) => {
      setLoginInfo(info);
      setStep(info.status === 'set' ? STEPS.ALREADY_SET_PASSWORD : STEPS.NO_PASSWORD);
    }).catch(console.error);
  }, []);

  const onPassChange = useCallback((pass: string | null): void => {
    setError('');
    setNewPassword(pass || '');
  }, []);

  const onCurrentPasswordChange = useCallback((pass: string | null): void => {
    setError('');
    setCurrentPassword(pass || '');
  }, []);

  const onSetPassword = useCallback(async () => {
    if (step === STEPS.ALREADY_SET_PASSWORD) {
      /** check if current password is correct */
      const hashedCurrentPassword = blake2AsHex(currentPassword, 256);

      if (loginInfo?.hashedPassword !== hashedCurrentPassword) {
        setError(t('Current password is not correct! try again.'));

        return;
      }
    }

    if (newPassword) {
      /** set a new password */
      const hashedPassword = blake2AsHex(newPassword, 256);
      const isConfirmed = await setStorage('loginInfo', { hashedPassword, lastLogin: Date.now(), status: 'set' });

      setStep(isConfirmed ? STEPS.NEW_PASSWORD_SET : STEPS.ERROR);
    }
  }, [currentPassword, loginInfo?.hashedPassword, newPassword, step, t]);

  const onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        text={t<string>('Manage Login Password')}
      />
      {error &&
        <Grid alignItems='center' container sx={{ height: '120px', top: '30px' }}>
          <Warning
            fontWeight={300}
            iconDanger
            theme={theme}
          >
            {error}
          </Warning>
        </Grid>
      }
      {step === STEPS.NO_PASSWORD &&
        <SetPassword
          error={error}
          onBackClick={onBackClick}
          onPassChange={onPassChange}
          onSetPassword={onSetPassword}
        />
      }
      {step === STEPS.ALREADY_SET_PASSWORD &&
        <Modify
          currentPassword={currentPassword}
          error={error}
          onBackClick={onBackClick}
          onCurrentPasswordChange={onCurrentPasswordChange}
          onPassChange={onPassChange}
          onSetPassword={onSetPassword}
          setStep={setStep}
        />
      }
      {step !== undefined && [STEPS.NEW_PASSWORD_SET, STEPS.PASSWORD_REMOVED].includes(step) &&
        <Confirmation
          onBackClick={onBackClick}
          step={step}
        />
      }
    </>
  );
}
