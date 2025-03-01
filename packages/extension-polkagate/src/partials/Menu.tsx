// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransitionProps } from '@mui/material/transitions';

import { Close as CloseIcon } from '@mui/icons-material';
import { Dialog, Divider, Grid, IconButton, Slide, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext, ActionContext, MenuItem, TwoButtons, VaadinIcon, Warning } from '../components';
import { setStorage } from '../components/Loading';
import { useTranslation } from '../hooks';
import { tieAccount } from '../messaging';
import { TEST_NETS } from '../util/constants';
import ImportAccSubMenu from './ImportAccSubMenu';
import NewAccountSubMenu from './NewAccountSubMenu';
import SettingSubMenu from './SettingSubMenu';
import TLFActions from './TLFActions';
import VersionSocial from './VersionSocial';

interface Props {
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
  isMenuOpen: boolean;
}

enum COLLAPSIBLE_MENUS {
  NONE,
  NEW_ACCOUNT,
  IMPORT_ACCOUNT,
  SETTING
}

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='left' ref={ref} {...props} />;
});

const Div = () => <Divider sx={{ bgcolor: 'divider', height: '1px', justifySelf: 'flex-end', mx: '10px', width: '83%' }} />;

function Menu({ isMenuOpen, setShowMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [collapsedMenu, setCollapsedMenu] = useState(COLLAPSIBLE_MENUS.SETTING);
  const [isTestnetEnableConfirmed, setIsTestnetEnableConfirmed] = useState<boolean>();
  const [showWarning, setShowWarning] = useState<boolean>();
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
    setShowMenu(false);
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

  return (
    <Dialog
      TransitionComponent={Transition}
      fullScreen
      open={isMenuOpen}
    >
      <Grid bgcolor='divider' container height='100%' justifyContent='end' zIndex={10}>
        <TLFActions />
        <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item p='10px' sx={{ height: '92%', minWidth: '307px', position: 'relative' }} width='86%'>
          {!showWarning
            ? <>
              <MenuItem
                iconComponent={
                  <VaadinIcon icon='vaadin:plus-circle' spin={collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT} style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
                }
                onClick={toggleNewAccountSubMenu}
                showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT}
                text={t('New account')}
                withHoverEffect
              >
                <NewAccountSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT} />
              </MenuItem>
              <Div />
              <MenuItem
                iconComponent={
                  <VaadinIcon float={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT} icon='vaadin:upload-alt' style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
                }
                onClick={toggleImportSubMenu}
                showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT}
                text={t('Import account')}
                withHoverEffect
              >
                <ImportAccSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT} toggleSettingSubMenu={toggleSettingSubMenu} />
              </MenuItem>
              <Div />
              <MenuItem
                iconComponent={
                  <VaadinIcon icon='vaadin:download' style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
                }
                onClick={_goToExportAll}
                text={t('Export all accounts')}
                withHoverEffect
              />
              <Div />
              <MenuItem
                iconComponent={
                  <VaadinIcon icon='vaadin:cog' spin={collapsedMenu === COLLAPSIBLE_MENUS.SETTING} style={{ color: `${theme.palette.text.primary}`, height: '18px' }} />
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
              <Grid item sx={{ pb: '35px', textAlign: 'center' }} xs={12}>
                <Typography fontSize='20px'>
                  {t('Warning')}
                </Typography>
              </Grid>
              <Grid container sx={{ '> div': { pl: 0 }, textAlign: 'justify' }}>
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
        <IconButton onClick={onCloseMenu} sx={{ left: '3%', p: 0, position: 'absolute', top: '1%' }}>
          <CloseIcon sx={{ color: 'secondary.light', fontSize: 35 }} />
        </IconButton>
      </Grid>
    </Dialog>
  );
}

export default React.memo(Menu);
