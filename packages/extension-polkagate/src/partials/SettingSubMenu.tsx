// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LockIcon from '@mui/icons-material/Lock';
import { Collapse, Divider, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { ActionContext, Checkbox2, ColorContext, FullScreenIcon, Infotip2, MenuItem, Select, Switch, VaadinIcon } from '../components';
import { getStorage, updateStorage } from '../components/Loading';
import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useIsLoginEnabled, useIsPopup, useTranslation } from '../hooks';
import { lockExtension, setNotification } from '../messaging';
import { NO_PASS_PERIOD } from '../util/constants';
import getLanguageOptions from '../util/getLanguageOptions';

interface Props {
  isTestnetEnabledChecked: boolean | undefined;
  setTestnetEnabledChecked: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  show: boolean;
  onChange: () => void;
}

export default function SettingSubMenu({ isTestnetEnabledChecked, onChange, setTestnetEnabledChecked, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPopup = useIsPopup();
  const isLoginEnabled = useIsLoginEnabled();
  const onAction = useContext(ActionContext);
  const colorMode = useContext(ColorContext);
  const { setExtensionLock } = useExtensionLockContext();

  const [notification, updateNotification] = useState(settings.notification);
  const [camera, setCamera] = useState(settings.camera === 'on');

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = useMemo(() => ['Extension', 'PopUp', 'Window'].map((item) => ({ text: item, value: item.toLowerCase() })), []);

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

  const onLockExtension = useCallback((): void => {
    updateStorage('loginInfo', { lastLoginTime: Date.now() - NO_PASS_PERIOD }).then(() => {
      setExtensionLock(true);
      lockExtension().catch(console.error);
    }).catch(console.error);
  }, [setExtensionLock]);

  const onAuthManagement = useCallback(() => {
    onAction('/auth-list');
  }, [onAction]);

  const onChangeLang = useCallback((value: string | number): void => {
    settings.set({ i18nLang: value as string });
  }, []);

  const onChangeTheme = useCallback((): void => {
    colorMode.toggleColorMode();
  }, [colorMode]);

  const onManageLoginPassword = useCallback(() => {
    onAction('/login-password');
  }, [onAction]);

  const onChangeNotification = useCallback((value: string | number): void => {
    const _value = value as string;

    setNotification(_value).catch(console.error);

    updateNotification(_value);
    settings.set({ notification: _value });
  }, []);

  const toggleCamera = useCallback(() => {
    setCamera(!camera);
  }, [camera]);

  useEffect(() => {
    getStorage('testnet_enabled').then((res) => {
      setTestnetEnabledChecked(!!res);
    }).catch(console.error);
  }, [setTestnetEnabledChecked]);

  return (
    <Collapse easing={{ enter: '200ms', exit: '100ms' }} in={show} sx={{ width: '100%' }}>
      <Grid container item>
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px', width: '100%' }} />
        <Grid container direction='column' pl='30px' pt='10px' sx={{ p: '10px', pr: 0 }}>
          <Grid alignItems='center' container item justifyContent='space-between'>
            <Grid item>
              <Switch
                checkedLabel={t('Dark')}
                defaultColor
                fontSize='17px'
                isChecked={theme.palette.mode === 'dark'}
                onChange={onChangeTheme}
                theme={theme}
                uncheckedLabel={t('Light')}
              />
            </Grid>
            {isLoginEnabled &&
              <>
                <Grid item>
                  <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '20px', my: 'auto' }} />
                </Grid>
                <Grid item>
                  <Infotip2
                    text={t('Lock Extension')}
                  >
                    <IconButton
                      onClick={onLockExtension}
                      sx={{ height: '35px', mr: '-5px', width: '35px' }}
                    >
                      <LockIcon sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: '25px' }} />
                    </IconButton>
                  </Infotip2>
                </Grid>
              </>
            }
            {isPopup &&
              <>
                <Grid item>
                  <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '20px', my: 'auto' }} />
                </Grid>
                <FullScreenIcon url='/' />
              </>
            }
          </Grid>
          <Grid item pt='15px' textAlign='left'>
            <Checkbox2
              checked={isTestnetEnabledChecked}
              iconStyle={{ transform: 'scale(1.13)' }}
              label={t('Enable testnet chains')}
              labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
              onChange={onChange}
            />
          </Grid>
          <Grid item pt='15px' textAlign='left'>
            <Checkbox2
              checked={camera}
              iconStyle={{ transform: 'scale(1.13)' }}
              label={t('Allow QR camera access')}
              labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
              onChange={toggleCamera}
            />
          </Grid>
          <Grid container item>
            <MenuItem
              fontSize='17px'
              iconComponent={
                <FontAwesomeIcon
                  color={`${theme.palette.text.primary}`}
                  fontSize='18px'
                  icon={faListCheck}
                />
              }
              onClick={onAuthManagement}
              text={t('Manage website access')}
            />
          </Grid>
          <Grid container item pb={'10px'}>
            <MenuItem
              fontSize='17px'
              iconComponent={
                <VaadinIcon icon='vaadin:key' style={{ color: `${theme.palette.text.primary}`, height: '18px'}} />
              }
              onClick={onManageLoginPassword}
              py='2px'
              text={t('Manage login password')}
            />
          </Grid>
          <Grid item pt='12px'>
            <Select
              defaultValue={languageOptions[0].value}
              label={t('Language')}
              onChange={onChangeLang}
              options={languageOptions}
              value={settings.i18nLang !== 'default' ? settings.i18nLang : languageOptions[0].value}
            />
          </Grid>
          <Grid item pt='10px'>
            <Select
              defaultValue={notificationOptions[1].value}
              label={t('Notification')}
              onChange={onChangeNotification}
              options={notificationOptions}
              value={notification ?? notificationOptions[1].value}
            />
          </Grid>
        </Grid>
      </Grid>
    </Collapse>
  );
}
