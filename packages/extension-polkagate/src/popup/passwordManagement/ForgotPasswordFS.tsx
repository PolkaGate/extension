// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle, faUnlockKeyhole } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { FullScreenHeader } from '@polkadot/extension-polkagate/src/fullscreen/governance/FullScreenHeader';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { useFullscreen } from '@polkadot/extension-polkagate/src/hooks';
import { lockExtension } from '@polkadot/extension-polkagate/src/messaging';
import { FULLSCREEN_WIDTH, NO_PASS_PERIOD } from '@polkadot/extension-polkagate/src/util/constants';

import { ActionContext, Checkbox2, TwoButtons } from '../../components';
import { updateStorage } from '../../components/Loading';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import useTranslation from '../../hooks/useTranslation';

export default function ForgotPasswordFS(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  useFullscreen();

  const { setExtensionLock } = useExtensionLockContext();

  const [isChecked, setChecked] = useState<boolean>(false);

  const onConfirmForgotPassword = useCallback(async (): Promise<void> => {
    await updateStorage('loginInfo', { status: 'forgot' });
    setExtensionLock(false);
    openOrFocusTab('/reset-wallet', true);
  }, [setExtensionLock]);

  const onClose = useCallback(() => {
    updateStorage('loginInfo', { lastLoginTime: Date.now() - NO_PASS_PERIOD }).then(() => {
      setExtensionLock(true);
      lockExtension().catch(console.error);
      onAction('/');
    }).catch(console.error);
  }, [onAction, setExtensionLock]);

  const onCheckChange = useCallback(() => {
    setChecked(!isChecked);
  }, [isChecked]);

  const onProceed = useCallback(() => {
    onConfirmForgotPassword().catch(console.error);
  }, [onConfirmForgotPassword]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader noAccountDropDown noChainSwitch />
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', px: '6%' }}>
        <Title
          icon={faUnlockKeyhole}
          text={t('Forgot Password')}
        />
        <Grid container direction='column' px='15px'>
          <Grid container direction='column' item justifyContent='center' pb='20px' pt='50px'>
            <Grid item textAlign='center'>
              <FontAwesomeIcon
                color={theme.palette.warning.main}
                icon={faExclamationTriangle}
                size='3x'
              />
            </Grid>
            <Grid item textAlign='center'>
              <Typography fontSize='16px' fontWeight={400} sx={{ color: 'warning.main' }}>
                {t('Are you sure you want to proceed?')}
              </Typography>
            </Grid>
            <Typography fontSize='16px' fontWeight={400} mt='25px' px='15px'>
              {t('This action will permanently delete your account(s), and password recovery will not be possible. You can reset your wallet by importing from a backup (JSON file or recovery phrase). ')}
            </Typography>
          </Grid>
          <Checkbox2
            checked={isChecked}
            label={t('I acknowledge permanent account(s) deletion.')}
            labelStyle={{ fontSize: '14px' }}
            onChange={onCheckChange}
            style={{ bottom: '80px', pl: '35px', position: 'absolute' }}
          />
        </Grid>
        <Grid container justifyContent='center' sx={{ bottom: 0, height: '60px', ml: '33px', position: 'absolute', width: '615px' }}>
          <TwoButtons
            disabled={!isChecked}
            onPrimaryClick={onProceed}
            onSecondaryClick={onClose}
            primaryBtnText={t('Proceed')}
            secondaryBtnText={t('Cancel')}
            width='100%'
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
