// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { ActionContext, WrongPasswordAlert } from '../../components';
import { getStorage, LoginInfo } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import Confirmation from './Confirmation';
import { STEPS } from './constants';
import Modify from './Modify';
import SetPassword from './SetPassword';

export const isPasswordCorrect = async (password: string, isHashed?: boolean) => {
  const hashedPassword = isHashed ? password : blake2AsHex(password, 256);
  const info = await getStorage('loginInfo') as LoginInfo;

  return info?.hashedPassword === hashedPassword;
};

export default function LoginPassword(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [step, setStep] = useState<number>();
  const [newPassword, setNewPassword] = useState<string>('');
  const [isPasswordError, setIsPasswordError] = useState(false);

  useEffect(() => {
    getStorage('loginInfo').then((info) => {
      setStep((info as LoginInfo).status === 'set' ? STEPS.ALREADY_SET_PASSWORD : STEPS.NO_PASSWORD);
    }).catch(console.error);
  }, []);

  const onPassChange = useCallback((pass: string | null): void => {
    setIsPasswordError(false);
    setNewPassword(pass || '');
  }, []);

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
      {isPasswordError &&
        <Grid alignItems='center' container sx={{ height: '120px', top: '30px' }}>
          <WrongPasswordAlert />
        </Grid>
      }
      {step === STEPS.NO_PASSWORD &&
        <SetPassword
          isPasswordError={isPasswordError}
          newPassword={newPassword}
          onBackClick={onBackClick}
          onPassChange={onPassChange}
          setStep={setStep}
        />
      }
      {step === STEPS.ALREADY_SET_PASSWORD &&
        <Modify
          isPasswordError={isPasswordError}
          newPassword={newPassword}
          onBackClick={onBackClick}
          onPassChange={onPassChange}
          setIsPasswordError={setIsPasswordError}
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
