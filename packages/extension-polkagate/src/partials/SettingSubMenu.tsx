// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faListCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, IconButton, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { ActionContext, Checkbox2, ColorContext, MenuItem, Select, Switch } from '../components';
import { useIsPopup, useTranslation } from '../hooks';
import { setNotification, windowOpen } from '../messaging';
import getLanguageOptions from '../util/getLanguageOptions';

export default function SettingSubMenu({ show }: { show: boolean }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPopup = useIsPopup();
  const onAction = useContext(ActionContext);
  const colorMode = useContext(ColorContext);

  const [notification, updateNotification] = useState(settings.notification);
  const [camera, setCamera] = useState(settings.camera === 'on');
  const [prefix, setPrefix] = useState(`${settings.prefix === -1 ? 42 : settings.prefix}`);

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = ['Extension', 'PopUp', 'Window'].map((item) => ({ text: item, value: item.toLowerCase() }));

  const [firstTime, setFirstTime] = useState<boolean>(true);

  useEffect(() => {
    show === false && setFirstTime(false);
  }, [show]);

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

  interface Option {
    text: string;
    value: string;
  }

  const prefixOptions = settings.availablePrefixes
    .filter(({ value }) => value !== -1)
    .map(({ text, value }): Option => ({ text, value: `${value}` }));

  const _onWindowOpen = useCallback((): void => {
    windowOpen('/').catch(console.error);
  }, []);

  const _onAuthManagement = useCallback(() => {
    onAction('/auth-list');
  }, [onAction]);

  const _onChangeLang = useCallback((value: string): void => {
    settings.set({ i18nLang: value });
  }, []);

  const _onChangePrefix = useCallback((value: string): void => {
    setPrefix(value);
    settings.set({ prefix: parseInt(value, 10) });
  }, []);

  const _onChangeTheme = useCallback((): void => {
    colorMode.toggleColorMode();
  }, [colorMode]);

  const _onChangeNotification = useCallback((value: string): void => {
    setNotification(value).catch(console.error);

    updateNotification(value);
    settings.set({ notification: value });
  }, []);

  const toggleCamera = useCallback(() => {
    setCamera(!camera);
  }, [camera]);

  const slideIn = keyframes`
  0% {
    display: none;
    height: 0;
  }
  100%{
    display: block;
    height: 350px;
  }
`;

  const slideOut = keyframes`
  0% {
    display: block;
    height: 350px;
  }
  100%{
    display: none;
    height: 0;
  }
`;

  return (
    <Grid container display='inherit' item overflow='hidden' sx={{ animationDelay: firstTime ? '0.2s' : '0s', animationDuration: show ? '0.3s' : '0.15s', animationFillMode: 'both', animationName: `${show ? slideIn : slideOut}` }}>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid container direction='column' pl='30px' pt='10px' sx={{ p: '18px 0 15px 10px' }}>
        <Grid alignItems='center' container item justifyContent='space-between'>
          <Grid item>
            <Switch
              checkedLabel={t<string>('Dark')}
              isChecked={theme.palette.mode === 'dark'}
              onChange={_onChangeTheme}
              theme={theme}
              uncheckedLabel={t<string>('Light')}
            />
          </Grid>
          {isPopup &&
            <>
              <Grid item>
                <Divider
                  orientation='vertical'
                  sx={{
                    backgroundColor: 'text.primary',
                    height: '20px',
                    my: 'auto'
                  }}
                />
              </Grid>
              <Grid item>
                <IconButton
                  onClick={_onWindowOpen}
                  sx={{ height: '35px', width: '35px', mr: '-5px' }}
                >
                  <vaadin-icon icon='vaadin:external-link' style={{ height: '20px', color: `${theme.palette.secondary.light}` }} />
                </IconButton>
              </Grid>
            </>
          }
        </Grid>
        <Grid item pt='12px'>
          <Select
            label={t<string>('Language')}
            onChange={_onChangeLang}
            options={languageOptions}
            value={settings.i18nLang !== 'default' ? settings.i18nLang : languageOptions[0].value}
          />
        </Grid>
        <Grid item pt='10px'>
          <Select
            label={t<string>('Notification')}
            onChange={_onChangeNotification}
            options={notificationOptions}
            value={notification ?? notificationOptions[1].value}
          />
        </Grid>
        <Grid item pt='15px' textAlign='left'>
          <Checkbox2
            checked={camera}
            iconStyle={{ transform: 'scale(1.13)' }}
            label={t<string>('Allow QR camera access')}
            labelStyle={{ fontWeight: '300', fontSize: '18px', marginLeft: '7px' }}
            onChange={toggleCamera}
          />
        </Grid>
        <Grid container item >
          <MenuItem
            iconComponent={
              <FontAwesomeIcon
                color={`${theme.palette.text.primary}`}
                fontSize='18px'
                icon={faListCheck}
              />
            }
            onClick={_onAuthManagement}
            text={t<string>('Manage website access')}
          />
        </Grid>
        <Grid item pt='7px'>
          <Select
            label={t<string>('Default display address format')}
            onChange={_onChangePrefix}
            options={prefixOptions}
            value={prefix ?? prefixOptions[2].value}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
