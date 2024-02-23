// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Box, Divider, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { checkBox, checkedBox } from '../../../assets/icons';
import { AccountContext, ActionContext, Select } from '../../../components';
import { useTranslation } from '../../../hooks';
import { setNotification, tieAccount } from '../../../messaging';
import { TEST_NETS } from '../../../util/constants';
import getLanguageOptions from '../../../util/getLanguageOptions';
import { TaskButton } from './HomeMenu';

interface Props {
  show: boolean;
}

const slideIn = keyframes`
0% {
  display: none;
  height: 0;
}
100%{
  display: block;
  height: 370px;
}
`;

const slideOut = keyframes`
0% {
  display: block;
  height: 370px;
}
100%{
  display: none;
  height: 0;
}
`;

export default function SettingSubMenuFullScreen({ show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();

  const onEnableTestNetClick = useCallback(() => {
    // !isTestnetEnabled && setShowWarning(true);

    if (isTestnetEnabled) {
      window.localStorage.setItem('testnet_enabled', 'false');
      setIsTestnetEnabled(false);
    }
  }, [isTestnetEnabled]);

  const [notification, updateNotification] = useState(settings.notification);
  const [camera, setCamera] = useState(settings.camera === 'on');

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = ['Extension', 'PopUp', 'Window'].map((item) => ({ text: item, value: item.toLowerCase() }));

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

  useEffect(() => {
    const isTestnetDisabled = window.localStorage.getItem('testnet_enabled') !== 'true';

    isTestnetDisabled && (
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      })
    );
  }, [accounts]);

  const onAuthManagement = useCallback(() => {
    onAction('/auth-list');
  }, [onAction]);

  const onChangeLang = useCallback((value: string): void => {
    settings.set({ i18nLang: value });
  }, []);

  const onManageLoginPassword = useCallback(() => {
    onAction('/login-password');
  }, [onAction]);

  const onChangeNotification = useCallback((value: string): void => {
    setNotification(value).catch(console.error);

    updateNotification(value);
    settings.set({ notification: value });
  }, []);

  const toggleCamera = useCallback(() => {
    setCamera(!camera);
  }, [camera]);

  useEffect(() => {
    setIsTestnetEnabled(window.localStorage.getItem('testnet_enabled') === 'true');
  }, [setIsTestnetEnabled]);

  return (
    <Grid container display='inherit' item overflow='hidden' sx={{ animationDelay: '0s', animationDuration: show ? '0.3s' : '0.15s', animationFillMode: 'both', animationName: `${show ? slideIn : slideOut}` }}>
      <Divider sx={{ bgcolor: borderColor, height: '1px' }} />
      <Grid container direction='column' sx={{ p: '0px 0 15px 40px' }}>
        <TaskButton
          borderColor={borderColor}
          icon={
            <Box
              component='img'
              src={isTestnetEnabled ? checkedBox : checkBox}
              sx={{ height: 20, width: 20 }}
            />
          }
          isSubMenu
          onClick={onEnableTestNetClick}
          text={t<string>('Enable testnet chains')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <Box
              component='img'
              src={camera ? checkedBox : checkBox}
              sx={{ height: 20, width: 20 }}
            />
          }
          isSubMenu
          onClick={toggleCamera}
          text={t<string>('Allow QR camera access')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:lines-list' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={onAuthManagement}
          text={t<string>('Manage website access')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:key' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={onManageLoginPassword}
          text={t<string>('Manage login password')}
        />
        <Grid item pt='12px'>
          <Select
            label={t<string>('Language')}
            onChange={onChangeLang}
            options={languageOptions}
            value={settings.i18nLang !== 'default' ? settings.i18nLang : languageOptions[0].value}
          />
        </Grid>
        <Grid item pt='10px'>
          <Select
            label={t<string>('Notification')}
            onChange={onChangeNotification}
            options={notificationOptions}
            value={notification ?? notificationOptions[1].value}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
