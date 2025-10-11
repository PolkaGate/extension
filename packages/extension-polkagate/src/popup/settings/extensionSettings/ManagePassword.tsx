// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useIsExtensionPopup from '@polkadot/extension-polkagate/src/hooks/useIsExtensionPopup';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { blake2AsHex } from '@polkadot/util-crypto';

import { ActionButton, GradientButton, MatchPasswordField, Motion, PasswordInput } from '../../../components';
import MySnackbar from '../../../components/MySnackbar';
import { useTranslation } from '../../../components/translate';
import { LOGIN_STATUS, type LoginInfo } from '../../passwordManagement/types';
import WarningBox from '../partials/WarningBox';

export const isPasswordCorrect = async (password: string, isHashed?: boolean) => {
  const hashedPassword = isHashed ? password : blake2AsHex(password, 256);
  const info = await getStorage(STORAGE_KEY.LOGIN_INFO) as LoginInfo;

  return info?.hashedPassword === hashedPassword;
};

export default function ManagePassword ({ onBack }: { onBack?: () => void }): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const [hasAlreadySetPassword, setAlreadySetPassword] = useState<boolean>();
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [passwordError, setPasswordError] = useState<boolean>(false);

  const readyToGo = useMemo(() => !!newPassword && (!hasAlreadySetPassword || currentPassword), [currentPassword, hasAlreadySetPassword, newPassword]);

  const onClose = useCallback(() => {
    setShowSnackbar(false);
    !passwordError && window.location.reload();
  }, [passwordError]);

  useEffect(() => {
    getStorage(STORAGE_KEY.LOGIN_INFO).then((info) => {
      setAlreadySetPassword((info as LoginInfo).status === LOGIN_STATUS.SET);
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

    setStorage(STORAGE_KEY.LOGIN_INFO, { hashedPassword: newPassword, lastEdit: Date.now(), lastLoginTime: Date.now(), status: LOGIN_STATUS.JUST_SET })
      .then(() => {
        setPasswordError(false);
        setShowSnackbar(true);
        setSnackbarText(t('Password has been changed!'));
      }).catch(console.error);
  }, [currentPassword, hasAlreadySetPassword, newPassword, readyToGo, t]);

  return (
    <Motion>
      <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ borderRadius: '14px', display: 'block', p: '1px' }}>
        <WarningBox
          description={t('If you forget your password, you need to reimport your accounts and make a new password. Export and store your accounts securely to avoid losing them.')}
          title={t('REMEMBER YOUR PASSWORD WELL AND KEEP IT SAFE')}
        />
        <Stack columnGap='15px' direction='column' sx={{ bgcolor: isExtension ? 'background.paper' : 'transparent', borderRadius: '14px', m: isExtension ? '5px 15px' : '25px 5px 0', position: 'relative', zIndex: 1 }}>
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
            title1={t('New Password')}
            title2={t('Confirm Password')}
          />
          <GradientButton
            disabled={!readyToGo}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={onSetPassword}
            style={{ flex: 'none', height: '44px', marginTop: isExtension ? '15px' : '25px', width: '100%' }}
            text={t('Set password')}
          />
          {!isExtension &&
            <ActionButton
              contentPlacement='center'
              onClick={onBack}
              style={{ height: '44px', marginTop: '20px', width: '100%' }}
              text={t('Back')}
            />
          }
        </Stack>
        <MySnackbar
          isError={passwordError}
          onClose={onClose}
          open={showSnackbar}
          text={snackbarText}
        />
      </Grid>
    </Motion>
  );
}
