// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LockIcon from '@mui/icons-material/Lock';
import { Divider, Grid, IconButton, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { AccountContext, ActionContext, Checkbox2, ColorContext, Infotip2, MenuItem, Select, Switch } from '../components';
import { updateStorage } from '../components/Loading';
import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useIsLoginEnabled, useIsPopup, useTranslation } from '../hooks';
import { setNotification, tieAccount, windowOpen } from '../messaging';
import { NO_PASS_PERIOD, TEST_NETS } from '../util/constants';
import getLanguageOptions from '../util/getLanguageOptions';
import { DropdownOption } from '../util/types';

interface Props {
  isTestnetEnabled: boolean | undefined;
  setIsTestnetEnabled: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  show: boolean;
  onChange: () => void;
  onCloseMenu: () => void
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

export default function SettingSubMenu({ isTestnetEnabled, onChange, setIsTestnetEnabled, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPopup = useIsPopup();
  const isLoginEnabled = useIsLoginEnabled();
  const onAction = useContext(ActionContext);
  const colorMode = useContext(ColorContext);
  const { accounts } = useContext(AccountContext);
  const { setExtensionLock } = useExtensionLockContext();

  const [notification, updateNotification] = useState(settings.notification);
  const [camera, setCamera] = useState(settings.camera === 'on');
  const [prefix, setPrefix] = useState(`${settings.prefix === -1 ? 42 : settings.prefix}`);
  const [firstTime, setFirstTime] = useState<boolean>(true);

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = ['Extension', 'PopUp', 'Window'].map((item) => ({ text: item, value: item.toLowerCase() }));

  useEffect(() => {
    show === false && setFirstTime(false);
  }, [show]);

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

  const prefixOptions = settings.availablePrefixes
    .filter(({ value }) => value !== -1)
    .map(({ text, value }): DropdownOption => ({ text, value: `${value}` }));

  const _onWindowOpen = useCallback((): void => {
    windowOpen('/').catch(console.error);
  }, []);

  const onLockExtension = useCallback((): void => {
    updateStorage('loginInfo', { lastLoginTime: Date.now() - NO_PASS_PERIOD }).then(() => {
      setExtensionLock(true);
    }).catch(console.error);
  }, [setExtensionLock]);

  const onAuthManagement = useCallback(() => {
    onAction('/auth-list');
  }, [onAction]);

  const onChangeLang = useCallback((value: string): void => {
    settings.set({ i18nLang: value });
  }, []);

  const onChangePrefix = useCallback((value: string): void => {
    setPrefix(value);
    settings.set({ prefix: parseInt(value, 10) });
  }, []);

  const onChangeTheme = useCallback((): void => {
    colorMode.toggleColorMode();
  }, [colorMode]);

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
    <Grid container display='inherit' item overflow='hidden' sx={{ animationDelay: firstTime ? '0.2s' : '0s', animationDuration: show ? '0.3s' : '0.15s', animationFillMode: 'both', animationName: `${show ? slideIn : slideOut}` }}>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid container direction='column' pl='30px' pt='10px' sx={{ p: '18px 0 15px 10px' }}>
        <Grid alignItems='center' container item justifyContent='space-between'>
          <Grid item>
            <Switch
              checkedLabel={t<string>('Dark')}
              fontSize='17px'
              isChecked={theme.palette.mode === 'dark'}
              onChange={onChangeTheme}
              theme={theme}
              uncheckedLabel={t<string>('Light')}
            />
          </Grid>
          {isPopup &&
            <>
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
              <Grid item>
                <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '20px', my: 'auto' }} />
              </Grid>
              <Grid item>
                <Infotip2
                  text={t('Fullscreen')}
                >
                  <IconButton
                    onClick={_onWindowOpen}
                    sx={{ height: '35px', mr: '-5px', width: '35px' }}
                  >
                    <vaadin-icon icon='vaadin:expand-full' style={{ height: '19px', color: `${theme.palette.secondary.light}` }} />
                  </IconButton>
                </Infotip2>
              </Grid>
            </>
          }
        </Grid>
        <Grid item pt='15px' textAlign='left'>
          <Checkbox2
            checked={isTestnetEnabled}
            iconStyle={{ transform: 'scale(1.13)' }}
            label={t<string>('Enable testnet chains')}
            labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
            onChange={onChange}
          />
        </Grid>
        <Grid item pt='15px' textAlign='left'>
          <Checkbox2
            checked={camera}
            iconStyle={{ transform: 'scale(1.13)' }}
            label={t<string>('Allow QR camera access')}
            labelStyle={{ fontSize: '17px', fontWeight: 300, marginLeft: '7px' }}
            onChange={toggleCamera}
          />
        </Grid>
        <Grid container item >
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
            text={t<string>('Manage website access')}
          />
        </Grid>
        <Grid container item pb={'10px'} >
          <MenuItem
            fontSize='17px'
            iconComponent={
              <vaadin-icon icon='vaadin:key' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onManageLoginPassword}
            py='2px'
            text={t('Manage login password')}
          />
        </Grid>
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
        {/* <Grid item pt='7px'>
          <Select
            label={t<string>('Default display address format')}
            onChange={onChangePrefix}
            options={prefixOptions}
            value={prefix ?? prefixOptions[2].value}
          />
        </Grid> */}
      </Grid>
    </Grid>
  );
}
