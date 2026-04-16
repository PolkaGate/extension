// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ResponseBiometricStatus } from '@polkadot/extension-base/utils/biometric';

import { Stack, Typography, useTheme } from '@mui/material';
import { InfoCircle } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { DecisionButtons, MySnackbar, MySwitch, MyTooltip, PasswordInput } from '../components';
import { useTranslation } from '../components/translate';
import { useIsExtensionPopup } from '../hooks';
import useIsPasswordCorrect from '../hooks/useIsPasswordCorrect';
import { disableBiometricUnlock, enableBiometricUnlock, getBiometricUnlockStatus } from '../messaging';
import { enrollBiometric } from '../util/biometric';
import SharePopup from './SharePopup';

interface Props {
  titleMargin?: string;
}

const EMPTY_STATUS: ResponseBiometricStatus = { enabled: false };

export default function BiometricUnlockSetting({ titleMargin = '40px 0 15px' }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();
  const { validatePasswordAsync } = useIsPasswordCorrect();

  const [status, setStatus] = useState<ResponseBiometricStatus>(EMPTY_STATUS);
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isError, setIsError] = useState(false);

  const showFeedback = useCallback((text: string, error = false) => {
    setSnackbarText(text);
    setIsError(error);
    setShowSnackbar(true);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const biometricStatus = await getBiometricUnlockStatus();

      setStatus(biometricStatus);
    } catch (error) {
      console.error('Unable to read biometric unlock status:', error);
      setStatus(EMPTY_STATUS);
    }
  }, []);

  useEffect(() => {
    refreshStatus().catch((error) => {
      console.error(error);
    });
  }, [refreshStatus]);

  const closeSnackbar = useCallback(() => setShowSnackbar(false), []);

  const onPasswordChange = useCallback((value: string | null) => {
    setPassword(value ?? '');
  }, []);

  const resetEnrollmentForm = useCallback(() => {
    setPassword('');
    setShowPasswordForm(false);
  }, []);

  const onToggle = useCallback(async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked) {
      if (status.enabled) {
        setBusy(true);

        try {
          const success = await disableBiometricUnlock();

          if (success) {
            setStatus(EMPTY_STATUS);
            resetEnrollmentForm();
            showFeedback(t('Biometric unlock has been disabled.'));
          } else {
            showFeedback(t('Unable to disable biometric unlock.'), true);
          }
        } catch (error) {
          console.error(error);
          showFeedback(t('Unable to disable biometric unlock.'), true);
        } finally {
          setBusy(false);
        }
      } else {
        resetEnrollmentForm();
      }

      return;
    }

    setShowPasswordForm(true);
  }, [resetEnrollmentForm, showFeedback, status.enabled, t]);

  const onEnable = useCallback(async () => {
    if (!password) {
      return;
    }

    setBusy(true);

    try {
      const isPasswordValid = await validatePasswordAsync(password);

      if (!isPasswordValid) {
        showFeedback(t('Current password is wrong!'), true);

        return;
      }

      const enrollment = await enrollBiometric(password);
      const success = await enableBiometricUnlock(enrollment);

      if (!success) {
        showFeedback(t('Unable to enable biometric unlock.'), true);

        return;
      }

      await refreshStatus();
      resetEnrollmentForm();
      showFeedback(t('Biometric unlock has been enabled.'));
    } catch (error) {
      console.error(error);
      resetEnrollmentForm();
      showFeedback(t((error as Error).message || 'Unable to enable biometric unlock.'), true);
    } finally {
      setBusy(false);
      setPassword('');
    }
  }, [password, refreshStatus, resetEnrollmentForm, showFeedback, t, validatePasswordAsync]);

  return (
    <>
      <Stack direction='column' sx={{ width: '100%' }}>
        <Stack alignItems='center' columnGap='6px' direction='row' m={titleMargin}>
          <Typography color={isExtension ? 'label.secondary' : 'text.primary'} fontSize={isExtension ? undefined : '22px'} sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
            {t('Biometric Unlock')}
          </Typography>
          <MyTooltip
            content={t('Available on supported Chromium browsers with a platform authenticator and WebAuthn PRF support.')}
          >
            <InfoCircle color={theme.palette.primary.main} size='16' variant='Bold' />
          </MyTooltip>
        </Stack>
        <MySwitch
          checked={status.enabled || showPasswordForm}
          columnGap='8px'
          disabled={isBusy}
          label={t('Unlock with biometrics')}
          onChange={onToggle}
        />
      </Stack>
      <SharePopup
        modalProps={{
          showBackIconAsClose: true
        }}
        modalStyle={{
          minHeight: '360px'
        }}
        onClose={resetEnrollmentForm}
        open={showPasswordForm}
        popupProps={{
          maxHeight: isExtension ? '280px' : '360px',
          pt: 200,
          withGradientBorder: true
        }}
        title={t('Enable Biometric Unlock')}
      >
        <Stack direction='column' sx={{ p: '0 5px 10px', rowGap: '16px', width: '100%' }}>
          <Typography color='text.secondary' sx={{ mt: '10px', textAlign: 'left' }} variant='B-4'>
            {t('Confirm your current password to securely enable biometric unlock on this device.')}
          </Typography>
          <PasswordInput
            focused
            onEnterPress={onEnable}
            onPassChange={onPasswordChange}
            title={t('Current Password')}
            value={password}
          />
          <DecisionButtons
            cancelButton
            direction='vertical'
            disabled={!password || isBusy}
            isBusy={isBusy}
            onPrimaryClick={onEnable}
            onSecondaryClick={resetEnrollmentForm}
            primaryBtnText={t('Enable biometrics')}
            secondaryBtnText={t('Cancel')}
            style={{ marginTop: '8px' }}
          />
        </Stack>
      </SharePopup>
      <MySnackbar
        isError={isError}
        onClose={closeSnackbar}
        open={showSnackbar}
        text={snackbarText}
      />
    </>
  );
}
