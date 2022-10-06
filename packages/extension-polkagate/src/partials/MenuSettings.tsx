// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { Theme, ThemeProps } from '../types';

import { faExpand, faTasks } from '@fortawesome/free-solid-svg-icons';
import { AddCircle as AddCircleIcon, Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, useTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';

import settings from '@polkadot/ui-settings';

import { ActionContext, ActionText, Checkbox, Dropdown, Menu, MenuDivider, Svg, Switch, themes, ThemeSwitchContext } from '../../../extension-ui/src/components';
import { SwitchModeButton } from '../../../extension-ui/src/components/SwitchModeButton ';
import useIsPopup from '../../../extension-ui/src/hooks/useIsPopup';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { setNotification, windowOpen } from '../../../extension-ui/src/messaging';
import getLanguageOptions from '../../../extension-ui/src/util/getLanguageOptions';
import { addCircle, addCircleB, exportIcon, exportIconB, importIcon, importIconB, roadBranch, roadBranchB, setting, settingB } from '../assets/icons';
import MenuItem from '../components/MenuItem';
import ImportAccSubMenu from './ImportAccSubMenu';
import SettingSubMenu from './SettingSubMenu';

interface Option {
  text: string;
  value: string;
}

interface Props {
  className?: string;
  reference: React.MutableRefObject<null>;
  theme: Theme;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
}

const notificationOptions = ['Extension', 'PopUp', 'Window']
  .map((item) => ({ text: item, value: item.toLowerCase() }));

const prefixOptions = settings.availablePrefixes
  .filter(({ value }) => value !== -1)
  .map(({ text, value }): Option => ({ text, value: `${value}` }));

export default function MenuSettings({ className, isMenuOpen, reference, setShowMenu, theme }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [showImportSubMenu, setShowImportSubMenu] = useState<boolean>(false);
  const [showSettingSubMenu, setShowSettingSubMenu] = useState<boolean>(true);
  const [camera, setCamera] = useState(settings.camera === 'on');
  const [prefix, setPrefix] = useState(`${settings.prefix === -1 ? 42 : settings.prefix}`);
  const [notification, updateNotification] = useState(settings.notification);
  const isPopup = useIsPopup();
  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const onAction = useContext(ActionContext);

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

  const toggleImportSubMenu = useCallback(() => {
    setShowImportSubMenu(!showImportSubMenu);
    showSettingSubMenu && setShowSettingSubMenu(!showSettingSubMenu);
  }, [showImportSubMenu, showSettingSubMenu]);

  const toggleSettingSubMenu = useCallback(() => {
    setShowSettingSubMenu(!showSettingSubMenu);
    showImportSubMenu && setShowImportSubMenu(!showImportSubMenu);
  }, [showImportSubMenu, showSettingSubMenu]);

  const _onChangePrefix = useCallback(
    (value: string): void => {
      setPrefix(value);
      settings.set({ prefix: parseInt(value, 10) });
    }, []
  );

  const _onChangeNotification = useCallback(
    (value: string): void => {
      setNotification(value).catch(console.error);

      updateNotification(value);
      settings.set({ notification: value });
    }, []
  );

  const _onWindowOpen = useCallback(
    (): void => {
      windowOpen('/').catch(console.error);
    }, []
  );

  const _onChangeLang = useCallback(
    (value: string): void => {
      settings.set({ i18nLang: value });
    }, []
  );

  const _goToAuthList = useCallback(
    () => {
      onAction('auth-list');
    }, [onAction]
  );

  const _toggleSettings = useCallback(
    () => setShowMenu((isMenuOpen) => !isMenuOpen),
    [setShowMenu]
  );

  return (
    <Grid
      alignItems='flex-start'
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='600px'
      justifyContent='end'
      sx={{ mixBlendMode: 'normal' }}
      zIndex={10}
    >
      <Grid
        alignItems='flex-start'
        bgcolor='background.default'
        container
        display='block'
        height='600px'
        item
        p='10px 24px'
        width='85%'
      >
        <MenuItem
          Icon={theme.palette.mode === 'dark' ? addCircle : addCircleB}
          // onClick={onnn}
          text='Create new account'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={theme.palette.mode === 'dark' ? roadBranch : roadBranchB}
          // onClick={}
          text='Derive from accounts'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={theme.palette.mode === 'dark' ? importIcon : importIconB}
          onClick={toggleImportSubMenu}
          showSubMenu={showImportSubMenu}
          text='Import account'
        >
          <ImportAccSubMenu />
        </MenuItem>
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={theme.palette.mode === 'dark' ? exportIcon : exportIconB}
          // onClick={onnn}
          text='Export all accounts'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={theme.palette.mode === 'dark' ? setting : settingB}
          onClick={toggleSettingSubMenu}
          showSubMenu={showSettingSubMenu}
          text='Setting'
        >
          <SettingSubMenu />
        </MenuItem>
        {/* <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} /> */}
      </Grid>
      <IconButton
        onClick={_toggleSettings}
        sx={{
          left: '3%',
          p: 0,
          position: 'absolute',
          top: '2%'
        }}
      >
        <CloseIcon sx={{ color: 'text.secondary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );
}
