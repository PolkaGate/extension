// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestBiometricAuthentication } from '@polkadot/extension-base/utils/biometric';

import { Grid, Stack } from '@mui/material';
import React, { useCallback, useState } from 'react';

import useBiometricAction from '@polkadot/extension-polkagate/src/hooks/useBiometricAction';
import useIsExtensionPopup from '@polkadot/extension-polkagate/src/hooks/useIsExtensionPopup';
import useIsPasswordCorrect from '@polkadot/extension-polkagate/src/hooks/useIsPasswordCorrect';
import { accountsChangePasswordAll, accountsChangePasswordAllWithBiometric, lockExtension } from '@polkadot/extension-polkagate/src/messaging';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { blake2AsHex } from '@polkadot/util-crypto';

import { ActionButton, GradientButton, MatchPasswordField, Motion, PasswordInput } from '../../../components';
import MySnackbar from '../../../components/MySnackbar';
import { useTranslation } from '../../../components/translate';
import { type LoginInfo } from '../../passwordManagement/types';
import WarningBox from '../partials/WarningBox';

// DEPRECATED, and will be removed int he future versions
export const isPasswordCorrect = async(password: string, isHashed?: boolean) => {
  const hashedPassword = isHashed ? password : blake2AsHex(password, 256);
  const info = await getStorage(STORAGE_KEY.LOGIN_INFO) as LoginInfo;

  return info?.hashedPassword === hashedPassword;
};

export default function ManagePassword({ onBack }: { onBack?: () => void }): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const [oldPass, setCurrentPassword] = useState<string>('');
  const [newPass, setNewPassword] = useState<string>();
  const [biometricAuth, setBiometricAuth] = useState<RequestBiometricAuthentication>();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);
  const [missionSucceeded, setMissionSucceeded] = useState<boolean>(false);

  const { validatePasswordAsync } = useIsPasswordCorrect();
  const { isBiometricAvailable, isBiometricBusy, runBiometricAction } = useBiometricAction();

  const onSnackbarClose = useCallback(() => {
    setShowSnackbar(false);

    if (missionSucceeded) {
      lockExtension().catch(console.error);
      window.location.hash = '/';
    }

    if (!passwordError) {
      window.location.reload();
    }
  }, [missionSucceeded, passwordError]);

  const onCurrentPasswordChange = useCallback((pass: string | null): void => {
    setBiometricAuth(undefined);
    setPasswordError(false);
    setCurrentPassword(pass || '');
  }, []);

  const onSetPassword = useCallback(async() => {
    if ((!oldPass && !biometricAuth) || !newPass) {
      return;
    }

    setBusy(true);

    if (biometricAuth) {
      try {
        const success = await accountsChangePasswordAllWithBiometric(newPass, biometricAuth);

        if (success) {
          await setStorage(STORAGE_KEY.LAST_PASS_CHANGE, Date.now());
        }

        setPasswordError(success !== true);
        setShowSnackbar(true);
        setSnackbarText(success ? t('Password has been changed!') : t('Password change failed'));
        setMissionSucceeded(success === true);
      } catch (error) {
        console.error(error);
        setPasswordError(true);
        setShowSnackbar(true);
        setSnackbarText(t('Biometric authentication failed'));
        setMissionSucceeded(false);
      } finally {
        setBusy(false);
      }

      return;
    }

    const isPasswordCorrect = await validatePasswordAsync(oldPass);

    if (!isPasswordCorrect) {
      setPasswordError(true);
      setShowSnackbar(true);
      setSnackbarText(t('Current password is wrong!'));
      setBusy(false);

      return;
    }

    try {
      await setStorage(STORAGE_KEY.LAST_PASS_CHANGE, Date.now());
      const success = await accountsChangePasswordAll(oldPass, newPass);

      setPasswordError(false);
      setShowSnackbar(true);
      setSnackbarText(success ? t('Password has been changed!') : t('Something went wrong while changing password!'));
      setBusy(false);
      setMissionSucceeded(success);
    } catch (error) {
      console.error(error);
      setBusy(false);
      setMissionSucceeded(false);
    }
  }, [biometricAuth, newPass, oldPass, t, validatePasswordAsync]);

  const onBiometricPassword = useCallback(async(): Promise<void> => {
    setBusy(true);

    try {
      const auth = await runBiometricAction((auth) => Promise.resolve(auth));

      if (!auth) {
        setPasswordError(true);

        return;
      }

      setBiometricAuth(auth);
      setCurrentPassword('');
      setPasswordError(false);
    } catch (error) {
      console.error(error);
      setPasswordError(true);
    } finally {
      setBusy(false);
    }
  }, [runBiometricAction]);

  return (
    <Motion>
      <Grid alignItems='flex-start' container item justifyContent='flex-start' sx={{ borderRadius: '14px', display: 'block', p: '1px' }}>
        <WarningBox
          description={t('If you forget your password, you need to reimport your accounts and make a new password. Export and store your accounts securely to avoid losing them.')}
          title={t('REMEMBER YOUR PASSWORD WELL AND KEEP IT SAFE')}
        />
        <Stack columnGap='15px' direction='column' sx={{ bgcolor: isExtension ? 'background.paper' : 'transparent', borderRadius: '14px', m: isExtension ? '5px 15px' : '25px 5px 0', position: 'relative', zIndex: 1 }}>
          <PasswordInput
            biometricDisabled={isBusy || isBiometricBusy}
            focused
            hasError={passwordError}
            isBiometricBusy={isBiometricBusy}
            isBiometricVerified={Boolean(biometricAuth)}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onBiometricClick={isBiometricAvailable ? onBiometricPassword : undefined}
            onPassChange={onCurrentPasswordChange}
            style={{ marginBottom: '18px' }}
            title={t('Current Password')}
            value={oldPass}
          />
          <MatchPasswordField
            onSetPassword={onSetPassword}
            setConfirmedPassword={setNewPassword}
            title1={t('New Password')}
            title2={t('Confirm Password')}
          />
          <GradientButton
            disabled={(!oldPass && !biometricAuth) || !newPass}
            isBusy={isBusy}
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
          onClose={onSnackbarClose}
          open={showSnackbar}
          text={snackbarText}
        />
      </Grid>
    </Motion>
  );
}
