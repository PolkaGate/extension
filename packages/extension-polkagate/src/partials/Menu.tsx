// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import { keyframes, Theme } from '@mui/material/styles';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext, ActionContext, MenuItem, TwoButtons, VaadinIcon,Warning } from '../components';
import { setStorage } from '../components/Loading';
import { useTranslation } from '../hooks';
import { tieAccount } from '../messaging';
import { TEST_NETS } from '../util/constants';
import ImportAccSubMenu from './ImportAccSubMenu';
import NewAccountSubMenu from './NewAccountSubMenu';
import SettingSubMenu from './SettingSubMenu';
import VersionSocial from './VersionSocial';

interface Props {
  theme: Theme;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const COLLAPSIBLE_MENUS = {
  NONE: 0,
  NEW_ACCOUNT: 1,
  IMPORT_ACCOUNT: 2,
  SETTING: 3
};

function Menu({ setShowMenu, theme }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [collapsedMenu, setCollapsedMenu] = useState<number>(COLLAPSIBLE_MENUS.SETTING);
  const [isTestnetEnableConfirmed, setIsTestnetEnableConfirmed] = useState<boolean>();
  const [showWarning, setShowWarning] = useState<boolean>();
  const [closeMenu, setCloseMenu] = useState<boolean>(false);
  const { accounts } = useContext(AccountContext);

  const toggleImportSubMenu = useCallback(() => {
    collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT
      ? setCollapsedMenu(COLLAPSIBLE_MENUS.NONE)
      : setCollapsedMenu(COLLAPSIBLE_MENUS.IMPORT_ACCOUNT);
  }, [collapsedMenu]);

  const toggleNewAccountSubMenu = useCallback(() => {
    collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT
      ? setCollapsedMenu(COLLAPSIBLE_MENUS.NONE)
      : setCollapsedMenu(COLLAPSIBLE_MENUS.NEW_ACCOUNT);
  }, [collapsedMenu]);

  const toggleSettingSubMenu = useCallback(() => {
    collapsedMenu === COLLAPSIBLE_MENUS.SETTING
      ? setCollapsedMenu(COLLAPSIBLE_MENUS.NONE)
      : setCollapsedMenu(COLLAPSIBLE_MENUS.SETTING);
  }, [collapsedMenu]);

  const onCloseMenu = useCallback(() => {
    setCloseMenu(true);
    setTimeout(() => setShowMenu(false), 300);
  }, [setShowMenu]);

  const _goToExportAll = useCallback(() => {
    onAction('/account/export-all');
  }, [onAction]);

  const onEnableTestnetConfirm = useCallback(() => {
    setShowWarning(false);
    setIsTestnetEnableConfirmed(true);
    setStorage('testnet_enabled', true).catch(console.error);
  }, []);

  const onEnableTestnetReject = useCallback(() => {
    setShowWarning(false);
    setIsTestnetEnableConfirmed(false);
  }, []);

  const onEnableTestNetClick = useCallback(() => {
    !isTestnetEnableConfirmed && setShowWarning(true);

    if (isTestnetEnableConfirmed) {
      setStorage('testnet_enabled', false).catch(console.error);
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      });
      setIsTestnetEnableConfirmed(false);
    }
  }, [accounts, isTestnetEnableConfirmed]);

  const slideLeft = keyframes`
  0% {
    width: 0;
  }
  100%{
    width: 100%;
  }
`;

  const slideRight = keyframes`
  0% {
    width: 100%;
  }
  100%{
    width: 0;
  }
`;

  return (
    <Grid bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'} container height='100%' justifyContent='end' sx={[{ animationDuration: '0.2s', animationFillMode: 'forwards', animationName: `${!closeMenu ? slideLeft : slideRight}`, position: 'absolute', right: 0, top: 0, mixBlendMode: 'normal', overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none', width: 0 } }]} zIndex={10}>
      <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item p='10px' sx={{ height: 'parent.innerHeight', minWidth: '307px', position: 'relative' }} width='86%'>
        {!showWarning
          ? <>
            <MenuItem
              iconComponent={
                <VaadinIcon icon='vaadin:plus-circle' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
              }
              onClick={toggleNewAccountSubMenu}
              showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT}
              text={t('New account')}
              withHoverEffect
            >
              <NewAccountSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT} />
            </MenuItem>
            <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
            <MenuItem
              iconComponent={
                <VaadinIcon icon='vaadin:upload-alt' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
              }
              onClick={toggleImportSubMenu}
              showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT}
              text={t('Import account')}
              withHoverEffect
            >
              <ImportAccSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT} toggleSettingSubMenu={toggleSettingSubMenu} />
            </MenuItem>
            <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
            <MenuItem
              iconComponent={
                <VaadinIcon icon='vaadin:download' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
              }
              onClick={_goToExportAll}
              text={t('Export all accounts')}
              withHoverEffect
            />
            <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
            <MenuItem
              iconComponent={
                <VaadinIcon icon='vaadin:cog' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
              }
              onClick={toggleSettingSubMenu}
              showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.SETTING}
              text={t('Settings')}
              withHoverEffect
            >
              <SettingSubMenu
                isTestnetEnabledChecked={isTestnetEnableConfirmed}
                onChange={onEnableTestNetClick}
                setTestnetEnabledChecked={setIsTestnetEnableConfirmed}
                show={collapsedMenu === COLLAPSIBLE_MENUS.SETTING}
              />
            </MenuItem>
          </>
          : <Grid container justifyContent='space-between' sx={{ pt: '30px' }}>
            <Grid item xs={12} sx={{ textAlign: 'center', pb: '35px' }}>
              <Typography fontSize='20px'>
                {t('Warning')}
              </Typography>
            </Grid>
            <Grid container sx={{ textAlign: 'justify', '> div': { pl: 0 } }}>
              <Warning
                iconDanger
                isBelowInput
                marginTop={0}
                theme={theme}
              >
                {t('Enabling testnet chains may cause instability or crashes since they\'re meant for testing. Proceed with caution. If issues arise, return here to disable the option.')}
              </Warning>
            </Grid>
            <Grid container>
              <TwoButtons
                mt='55px'
                onPrimaryClick={onEnableTestnetConfirm}
                onSecondaryClick={onEnableTestnetReject}
                primaryBtnText={t<string>('Confirm')}
                secondaryBtnText={t<string>('Reject')}
              />
            </Grid>
          </Grid>
        }
        <VersionSocial fontSize='11px' />
      </Grid>
      <IconButton onClick={onCloseMenu} sx={{ left: '3%', p: 0, position: 'absolute', top: '2%' }}>
        <CloseIcon sx={{ color: 'text.secondary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );
}

export default React.memo(Menu);
