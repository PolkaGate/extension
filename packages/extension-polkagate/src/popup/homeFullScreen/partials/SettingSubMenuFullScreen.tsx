// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Box, Collapse, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { checkBox, checkedBox } from '../../../assets/icons';
import { AccountContext, Select } from '../../../components';
import { getStorage, setStorage } from '../../../components/Loading';
import { useIsTestnetEnabled, useTranslation } from '../../../hooks';
import { setNotification, tieAccount } from '../../../messaging';
import { TEST_NETS } from '../../../util/constants';
import getLanguageOptions from '../../../util/getLanguageOptions';
import EnableTestNetsModal from './EnableTestNetsModal';
import { TaskButton } from './HomeMenu';
import ManageLoginPassword from './ManageLoginPassword';
import ManageWebAccess from './ManageWebAccess';

interface Props {
  show: boolean;
}

export default function SettingSubMenuFullScreen({ show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);
  const isTestnetEnabled = useIsTestnetEnabled();

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const [isEnableTestnetChecked, setIsTestnetEnabledChecked] = useState<boolean>();
  const [testnetWarning, setShowTestnetWarning] = useState<boolean>(false);
  const [showManageWebAccess, setShowManageWebAccess] = useState<boolean>(false);
  const [showManageLoginPassword, setShowManageLoginPassword] = useState<boolean>(false);

  const onEnableTestNetClick = useCallback(() => {
    !isEnableTestnetChecked && setShowTestnetWarning(true);

    if (isEnableTestnetChecked) {
      setStorage('testnet_enabled', false).catch(console.error);
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      });
      setIsTestnetEnabledChecked(false);
    }
  }, [accounts, isEnableTestnetChecked]);

  const [notification, updateNotification] = useState(settings.notification);
  const [camera, setCamera] = useState(settings.camera === 'on');

  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const notificationOptions = ['Extension', 'PopUp', 'Window'].map((item) => ({ text: item, value: item.toLowerCase() }));

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

  useEffect(() => {
    !isEnableTestnetChecked && (
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      })
    );
  }, [accounts, isEnableTestnetChecked]);

  const onAuthManagement = useCallback(() => {
    setShowManageWebAccess(true);
  }, []);

  const onChangeLang = useCallback((value: string): void => {
    settings.set({ i18nLang: value });
  }, []);

  const onManageLoginPassword = useCallback(() => {
    setShowManageLoginPassword(true);
  }, []);

  const onChangeNotification = useCallback((value: string): void => {
    setNotification(value).catch(console.error);

    updateNotification(value);
    settings.set({ notification: value });
  }, []);

  const toggleCamera = useCallback(() => {
    setCamera(!camera);
  }, [camera]);

  useEffect(() => {
    getStorage('testnet_enabled').then((res) => {
      setIsTestnetEnabledChecked(res as boolean);
    }).catch(console.error);
  }, [setIsTestnetEnabledChecked]);

  return (
    <>
      <Collapse in={show}>
        <>
          <Divider sx={{ bgcolor: borderColor, height: '1px' }} />
          <Grid container direction='column' sx={{ p: '0px 0 15px 40px' }}>
            <TaskButton
              borderColor={borderColor}
              icon={
                <Box
                  component='img'
                  src={isTestnetEnabled ? checkedBox as string : checkBox as string}
                  sx={{ height: 20, width: 20 }}
                />
              }
              isSubMenu
              onClick={onEnableTestNetClick}
              text={t('Enable testnet chains')}
            />
            <TaskButton
              borderColor={borderColor}
              icon={
                <Box
                  component='img'
                  src={camera ? checkedBox as string : checkBox as string}
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
        </>
      </Collapse>
      <EnableTestNetsModal
        open={testnetWarning}
        setDisplayPopup={setShowTestnetWarning}
        setIsTestnetEnabled={setIsTestnetEnabledChecked}
      />
      <ManageWebAccess
        open={showManageWebAccess}
        setDisplayPopup={setShowManageWebAccess}
      />
      <ManageLoginPassword
        open={showManageLoginPassword}
        setDisplayPopup={setShowManageLoginPassword}
      />
    </>
  );
}
