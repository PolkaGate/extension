// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ActionContext, GradientButton, MatchPasswordField, PasswordInput } from '../../../components';
import { type LoginInfo } from '../../../components/Loading';
import { useTranslation } from '../../../components/translate';
import { getStorage, setStorage } from '../../../util';
import { isPasswordCorrect } from '../../passwordManagement';
import WarningBox from '../partials/WarningBox';
import MySnackbar from './components/MySnackbar';

export default function ManagePassword (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const [hasAlreadySetPassword, setAlreadySetPassword] = useState<boolean>();
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [passwordError, setPasswordError] = useState<boolean>(false);

  const readyToGo = useMemo(() => !!newPassword && (!hasAlreadySetPassword || currentPassword), [currentPassword, hasAlreadySetPassword, newPassword]);

  const onClose = useCallback(() => {
    setShowSnackbar(false);
    !passwordError && onAction('/');
  }, [onAction, passwordError]);

  useEffect(() => {
    getStorage('loginInfo').then((info) => {
      setAlreadySetPassword((info as LoginInfo).status === 'set');
    }).catch(console.error);
  }, []);

  const onCurrentPasswordChange = useCallback((pass: string | null): void => {
    setPasswordError(false);
    setCurrentPassword(pass || '');
  }, []);

  const onSetPassword = useCallback(async () => {
    if (!readyToGo) {
      return;
    }

    if (hasAlreadySetPassword && !await isPasswordCorrect(currentPassword)) {
      setPasswordError(true);
      setShowSnackbar(true);
      setSnackbarText(t('Current password is wrong!'));

      return;
    }

    setStorage('loginInfo',
      { hashedPassword: newPassword, lastLoginTime: Date.now(), status: 'justSet' }
    ).then(() => {
      setPasswordError(false);
      setShowSnackbar(true);
      setSnackbarText(t('Password has been changed!'));
    }).catch(console.error);
  }, [currentPassword, hasAlreadySetPassword, newPassword, readyToGo, t]);

  return (
    <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ borderRadius: '14px', display: 'block', p: '1px' }}>
      <WarningBox
        description={t('If you forget your password, you need to reimport your accounts and make a new password. Export and store your accounts securely to avoid losing them.')}
        title={t('REMEMBER YOUR PASSWORD WELL AND KEEP  IT SAFE')}
      />
      <Stack columnGap='15px' direction='column' sx={{ bgcolor: 'background.paper', borderRadius: '14px', p: '15px' }}>
        {hasAlreadySetPassword &&
          <PasswordInput
            focused
            hasError={passwordError}
            onPassChange={onCurrentPasswordChange}
            style={{ marginBottom: '18px' }}
            title={t('Current Password')}
          />
        }
        <MatchPasswordField
          focused
          hashPassword
          onSetPassword={onSetPassword}
          setConfirmedPassword={setNewPassword}
          style={{ marginBottom: '15px' }}
          title1={t('New Password')}
          title2={t('Confirm Password')}
        />
        <GradientButton
          disabled={!readyToGo}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={onSetPassword}
          style={{ flex: 'none', height: '48px', width: '100%' }}
          text={t('Set password')}
        />
      </Stack>
      <MySnackbar
        onClose={onClose}
        open={showSnackbar}
        text={snackbarText}
      />
    </Grid>
  );
}
