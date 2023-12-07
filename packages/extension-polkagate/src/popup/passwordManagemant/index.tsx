// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Check as CheckIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { blake2AsHex } from '@polkadot/util-crypto';

import { ActionContext, Password, PButton, TwoButtons, Warning } from '../../components';
import { getStorage, LoginInfo, PasswordSettingAlert, setStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import Passwords2 from '../createAccountFullScreen/components/Passwords2';

const STEPS = {
  NO_PASSWORD: 0,
  ALREADY_SET_PASSWORD: 1,
  NEW_PASSWORD_SET: 2,
  PASSWORD_REMOVED: 3,
  ERROR: 5
}

export default function LoginPassword(): React.ReactElement {
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
    } else {
      /** remove password */
      const isConfirmed = await setStorage('loginInfo', { status: 'no' });

      setStep(isConfirmed ? STEPS.PASSWORD_REMOVED : STEPS.ERROR);
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
        <>
          {!error &&
            <Grid container sx={{ height: '120px', top: '30px' }}>
              <Warning
                fontWeight={300}
                theme={theme}
              >
                <PasswordSettingAlert />
              </Warning>
            </Grid>
          }
          <Grid container justifyContent='center' sx={{ display: 'block', px: '10%', pt: '180px' }}>
            <Passwords2
              firstPassStyle={{ marginBlock: '8px' }}
              isFocussed
              label={t<string>('Password')}
              onChange={onPassChange}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onEnter={onSetPassword}
            />
            <PButton
              _ml={0}
              _mt='20px'
              _onClick={onBackClick}
              _variant='outlined'
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
        </>
      }
      {STEPS.ALREADY_SET_PASSWORD === step &&
        <>
          {!error &&
            <Grid alignContent='center' container sx={{ height: '120px', top: '30px' }}>
              <Warning
                fontWeight={300}
                marginRight={18}
                theme={theme}
              >
                <Grid item>
                  <b>{t<string>('You are about to modify your password. ')}</b>
                  {t<string>('You can set a new password or leave the new password field and its repeat blank to remove the password.')}
                </Grid>
              </Warning>
            </Grid>
          }
          <Grid container sx={{ bottom: '85px', display: 'block', position: 'absolute', px: '10%' }}>
            <Password
              isFocused
              label={t('Current password')}
              onChange={onCurrentPasswordChange}
              style={{ marginBottom: '25px' }}
            />
            <Passwords2
              firstPassStyle={{ marginBlock: '8px' }}
              label={t<string>('New password')}
              onChange={onPassChange}
              onEnter={onSetPassword}
            />
          </Grid>
          <TwoButtons
            disabled={!currentPassword}
            onPrimaryClick={onSetPassword}
            onSecondaryClick={onBackClick}
            primaryBtnText={t<string>('Set')}
            secondaryBtnText={t<string>('Cancel')}
          />
        </>
      }
      {[STEPS.NEW_PASSWORD_SET, STEPS.PASSWORD_REMOVED].includes(step) &&
        <>
          <Grid container justifyContent='center' sx={{ mt: '50px' }}>
            <CheckIcon
              sx={{
                bgcolor: 'success.main',
                borderRadius: '50%',
                color: 'white',
                fontSize: 50,
                stroke: 'white'
              }}
            />
            <Grid container justifyContent='center' pt='10px'>
              <Typography variant='body1'>
                {step === STEPS.NEW_PASSWORD_SET
                  ? t('Password has been set successfully!')
                  : t('Password has been REMOVED successfully!')
                }
              </Typography>
            </Grid>
          </Grid>
          <Grid container justifyContent='center' sx={{ display: 'block', px: '10%', pt: '180px' }}>
            <PButton
              _ml={0}
              _onClick={onBackClick}
              _width={80}
              text={t('Done')}
            />
          </Grid>
        </>
      }
    </>
  );
}
