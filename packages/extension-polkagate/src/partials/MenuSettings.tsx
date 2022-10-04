// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { Theme, ThemeProps } from '../types';

import { faExpand, faTasks } from '@fortawesome/free-solid-svg-icons';
import { AddCircle as AddCircleIcon, Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton } from '@mui/material';
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
import { addCircle, exportIcon, importIcon, roadBranch, setting } from '../assets/icons';
import MenuItem from '../components/MenuItem';

interface Option {
  text: string;
  value: string;
}

interface Props {
  className?: string;
  reference: React.MutableRefObject<null>;
  theme: Theme;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  isSettingsOpen: boolean;
}

const notificationOptions = ['Extension', 'PopUp', 'Window']
  .map((item) => ({ text: item, value: item.toLowerCase() }));

const prefixOptions = settings.availablePrefixes
  .filter(({ value }) => value !== -1)
  .map(({ text, value }): Option => ({ text, value: `${value}` }));

export default function MenuSettings({ className, isSettingsOpen, reference, setShowSettings, theme }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [camera, setCamera] = useState(settings.camera === 'on');
  const [prefix, setPrefix] = useState(`${settings.prefix === -1 ? 42 : settings.prefix}`);
  const [notification, updateNotification] = useState(settings.notification);
  const setTheme = useContext(ThemeSwitchContext);
  const isPopup = useIsPopup();
  const languageOptions = useMemo(() => getLanguageOptions(), []);
  const onAction = useContext(ActionContext);

  useEffect(() => {
    settings.set({ camera: camera ? 'on' : 'off' });
  }, [camera]);

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

  const onnn = useCallback(() => {
    console.log('cliiiiiiiiiiiiiiiiick');
  }, []);

  const _onChangeTheme = useCallback(
    (checked: boolean): void => setTheme(checked ? 'dark' : 'light'),
    [setTheme]
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
    () => setShowSettings((isSettingsOpen) => !isSettingsOpen),
    [setShowSettings]
  );

  return (
    // <Menu
    //   className={className}
    //   reference={reference}
    // >
    //   <MenuItem
    //     className='setting'
    //     title='Theme'
    //   >
    //     <SwitchModeButton />
    //   </MenuItem>
    //   {/* <MenuItem
    //     className='setting'
    //     title='Theme'
    //   >
    //     <Switch
    //       checked={true}//{themeContext.id === themes.dark.id}
    //       checkedLabel={t<string>('Dark')}
    //       onChange={_onChangeTheme}
    //       uncheckedLabel={t<string>('Light')}
    //     />
    //   </MenuItem> */}
    //   <MenuItem
    //     className='setting'
    //     title={t<string>('Display address format for')}
    //   >
    //     <Dropdown
    //       className='dropdown'
    //       label=''
    //       onChange={_onChangePrefix}
    //       options={prefixOptions}
    //       value={`${prefix}`}
    //     />
    //   </MenuItem>
    //   <MenuItem
    //     className='setting'
    //     title={t<string>('Language')}
    //   >
    //     <Dropdown
    //       className='dropdown'
    //       label=''
    //       onChange={_onChangeLang}
    //       options={languageOptions}
    //       value={settings.i18nLang}
    //     />
    //   </MenuItem>
    //   <MenuItem
    //     className='setting'
    //     title={t<string>('Notifications')}
    //   >
    //     <Dropdown
    //       className='dropdown'
    //       label=''
    //       onChange={_onChangeNotification}
    //       options={notificationOptions}
    //       value={notification}
    //     />
    //   </MenuItem>
    //   <MenuItem
    //     className='setting'
    //     title={t<string>('External accounts and Access')}
    //   >
    //     <Checkbox
    //       checked={camera}
    //       className='checkbox camera'
    //       label={t<string>('Allow QR Camera Access')}
    //       onChange={setCamera}
    //       theme={theme}
    //     />
    //   </MenuItem>
    //   <MenuDivider />
    //   <MenuItem className='setting'>
    //     <ActionText
    //       className='manageWebsiteAccess'
    //       icon={faTasks}
    //       onClick={_goToAuthList}
    //       text={t<string>('Manage Website Access')}
    //     />
    //   </MenuItem>
    //   {isPopup && (
    //     <MenuItem className='setting'>
    //       <ActionText
    //         className='openWindow'
    //         icon={faExpand}
    //         onClick={_onWindowOpen}
    //         text={t<string>('Open extension in new window')}
    //       />
    //     </MenuItem>
    //   )}
    // </Menu>
    <Grid
      alignItems='flex-start'
      bgcolor='rgba(255, 255, 255, 0.9)'
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
          Icon={addCircle}
          hasSubMenu={false}
          onClick={onnn}
          text='Create new account'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={roadBranch}
          hasSubMenu={false}
          onClick={onnn}
          text='Derive from accounts'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={importIcon}
          hasSubMenu={true}
          onClick={onnn}
          text='Import account'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={exportIcon}
          hasSubMenu={false}
          onClick={onnn}
          text='Export all accounts'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          Icon={setting}
          hasSubMenu={true}
          onClick={onnn}
          text='Setting'
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      </Grid>
      <IconButton
        onClick={_toggleSettings}
        sx={{
          left: '3%',
          position: 'absolute',
          top: '2%',
          p: 0
        }}
      >
        <CloseIcon sx={{ color: 'text.secondary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );
}

// export default React.memo(styled(MenuSettings)(({ theme }: Props) => `
//   position: absolute;
//   top: 8px;
//   user-select: none;
//   background: ${theme.palette.background.default};

//   .openWindow, .manageWebsiteAccess{
//     span {
//       color: ${theme.palette.primary};
//       // font-size: ${theme.fontSize};
//       // line-height: ${theme.lineHeight};
//       text-decoration: none;
//       vertical-align: middle;
//     }

//     ${Svg} {
//       background: ${theme.palette.background.default};
//       height: 20px;
//       top: 4px;
//       width: 20px;
//     }
//   }

//   > .setting {
//     > .checkbox {
//       color: ${theme.palette.primary};
//       line-height: 20px;
//       font-size: 15px;
//       margin-bottom: 0;

//       &.ledger {
//         margin-top: 0.2rem;
//       }

//       label {
//         color: ${theme.palette.primary};
//       }
//     }

//     > .dropdown {
//       background: ${theme.palette.primary};
//       margin-bottom: 0;
//       margin-top: 9px;
//       margin-right: 0;
//       width: 100%;
//     }
//   }
// `));
