// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faFileExport, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon, Email as EmailIcon, Language as LanguageIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Link } from '@mui/material';
import { keyframes, Theme } from '@mui/material/styles';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { riot } from '../assets/icons';
import { ActionContext, MenuItem } from '../components';
import { useTranslation } from '../hooks';
import ImportAccSubMenu from './ImportAccSubMenu';
import NewAccountSubMenu from './NewAccountSubMenu';
import SettingSubMenu from './SettingSubMenu';

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
  const [collapsedMenu, setCollapsedMenu] = useState<number>(COLLAPSIBLE_MENUS.SETTING);
  const onAction = useContext(ActionContext);

  const [data, setData] = useState<{ version: 'string' }>();
  const [closeMenu, setCloseMenu] = useState<boolean>(false);

  const fetchJson = () => {
    fetch('./manifest.json')
      .then((response) => {
        return response.json();
      }).then((data) => {
        setData(data);
      }).catch((e: Error) => {
        console.log(e.message);
      });
  };

  useEffect(() => {
    fetchJson();
  }, []);

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

  const _toggleSettings = useCallback(() => {
    setCloseMenu(true);
    setTimeout(() => setShowMenu(false), 300);
  }, [setShowMenu]);

  const _goToExportAll = useCallback(
    () => {
      onAction('/account/export-all');
    }, [onAction]
  );

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
    <Grid
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='100%'
      justifyContent='end'
      sx={[{
        animationDuration: '0.2s',
        animationFillMode: 'forwards',
        animationName: `${!closeMenu ? slideLeft : slideRight}`,
        position: 'absolute',
        right: 0,
        position: 'absolute',
        top: 0,
        mixBlendMode: 'normal',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0
        }
      }]}
      zIndex={10}
    >
      <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item p='10px 24px' sx={{ height: 'parent.innerHeight', position: 'relative' }} width='86%'>
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:plus-circle-o' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={toggleNewAccountSubMenu}
          text={t('New account')}
        >
          <NewAccountSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.NEW_ACCOUNT} />
        </MenuItem>
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          iconComponent={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              icon={faFileImport}
            />
          }
          onClick={toggleImportSubMenu}
          showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT}
          text={t('Import account')}
        >
          <ImportAccSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.IMPORT_ACCOUNT} toggleSettingSubMenu={toggleSettingSubMenu} />
        </MenuItem>
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          iconComponent={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              icon={faFileExport}
            />
          }
          onClick={_goToExportAll}
          text={t('Export all accounts')}
        />
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:cog' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={toggleSettingSubMenu}
          showSubMenu={collapsedMenu === COLLAPSIBLE_MENUS.SETTING}
          text={t('Setting')}
        >
          <SettingSubMenu show={collapsedMenu === COLLAPSIBLE_MENUS.SETTING} />
        </MenuItem>
        <Grid container justifyContent='space-between' fontSize='11px' sx={{ position: 'absolute', bottom: '10px', width: '85%', pl: '10px' }}>
          <Grid item>
            {`${t('Version')} ${data?.version || ''}`}
          </Grid>
          <Grid container width='fit-content'>
            <Grid item>
              <Link href={'mailto:polkagate@outlook.com'}>
                <EmailIcon sx={{ color: '#1E5AEF', fontSize: 15 }} />
              </Link>
            </Grid>
            <Grid item pl='5px'>
              <Link href='https://polkagate.xyz' rel='noreferrer' target='_blank'>
                <LanguageIcon sx={{ color: '#007CC4', fontSize: 15 }} />
              </Link>
            </Grid>
            <Grid item pl='5px'>
              <Link href='https://twitter.com/@polkagate' rel='noreferrer' target='_blank'>
                <TwitterIcon sx={{ color: '#2AA9E0', fontSize: 15 }} />
              </Link>
            </Grid>
            <Grid item pl='5px'>
              <Link href='https://matrix.to/#/#polkagate:matrix.org' rel='noreferrer' target='_blank'>
                <Box component='img' src={riot} sx={{ height: '12px', width: '12px', mt: '2px' }} />
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <IconButton onClick={_toggleSettings} sx={{ left: '3%', p: 0, position: 'absolute', top: '2%' }}>
        <CloseIcon sx={{ color: 'text.secondary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );
}

export default React.memo(Menu);
