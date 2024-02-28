// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, OpenInNewRounded as OpenInNewRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { AccountContext, ActionContext } from '../../../components';
import { useTranslation } from '../../../hooks';
import VersionSocial from '../../../partials/VersionSocial';
import ExportAllModal from './ExportAllModal';
import ImportAccSubMenuFullScreen from './ImportAccSubMenuFullScreen';
import SettingSubMenuFullScreen from './SettingSubMenuFullScreen';

interface TaskButtonProps {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
  secondaryIconType?: 'popup' | 'page';
  noBorderButton?: boolean;
  borderColor: string;
  disabled?: boolean;
  hasChildren?: boolean;
  showChildren?: boolean;
  children?: React.ReactElement;
  extra?: React.ReactElement;
  isSubMenu?: boolean;
}

export const TaskButton = ({ borderColor, children, disabled, extra, hasChildren, icon, isSubMenu, noBorderButton = false, onClick, secondaryIconType, showChildren, text }: TaskButtonProps) => {
  const theme = useTheme();

  return (
    <>
      <Grid alignItems='center' container item justifyContent='space-between' onClick={disabled ? () => null : onClick} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : borderColor }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', minHeight: isSubMenu ? '40px' : '45px', p: '5px 0px 5px 10px', my: '5px' }}>
        <Grid container item xs={2}>
          {icon}
        </Grid>
        <Grid container item justifyContent='left' xs>
          <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
            {text}
          </Typography>
        </Grid>
        {secondaryIconType &&
          <Grid alignItems='center' container item justifyContent='flex-end' xs={1}>
            {secondaryIconType === 'page'
              ? <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1, transform: hasChildren ? showChildren ? 'rotate(-90deg)' : 'rotate(90deg)' : 'rotate(0deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
              : <OpenInNewRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '25px' }} />
            }
          </Grid>
        }
      </Grid>
      {extra}
      <Grid container item justifyContent='flex-end'>
        {!noBorderButton && <Divider sx={{ bgcolor: borderColor, height: '2px', width: '98%' }} />}
      </Grid>
      {children}
    </>
  );
};

export default function HomeMenu(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { master } = useContext(AccountContext);

  const [showImport, setShowImport] = useState<boolean>(false);
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const [showExportAll, setShowExportAll] = useState<boolean>(false);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const onSend = useCallback(() => {
    onAction('/account/create');
  }, [onAction]);

  const onExportAll = useCallback(() => {
    setShowExportAll(true);
  }, []);

  const onImportClick = useCallback(() => {
    setShowImport(!showImport);
    setShowSetting(false);
  }, [showImport]);

  const onSettingClick = useCallback(() => {
    setShowSetting(!showSetting);
    setShowImport(false);
  }, [showSetting]);

  const onDeriveFromAccounts = useCallback(() => {
    master && onAction(`/fullscreenDerive/${master.address}`);
  }, [master, onAction]);

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px', width: '430px', position: 'relative' }}>
      <Grid alignItems='center' container direction='column' display='block' item justifyContent='center' sx={{ pb: '40px' }}>
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:plus-circle' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={onSend}
          secondaryIconType='page'
          text={t<string>('Create new account')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={onDeriveFromAccounts}
          secondaryIconType='page'
          text={t<string>('Derive from accounts')}
        />
        <TaskButton
          borderColor={borderColor}
          hasChildren
          icon={
            <vaadin-icon icon='vaadin:upload-alt' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={onImportClick}
          secondaryIconType='page'
          showChildren={showImport}
          text={t<string>('Import account')}
        >
          <ImportAccSubMenuFullScreen show={showImport} toggleSettingSubMenu={onSettingClick} />
        </TaskButton>
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:download' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={onExportAll}
          secondaryIconType='page'
          secondaryIconType='popup'
          text={t<string>('Export all accounts')}
        />
        <TaskButton
          borderColor={borderColor}
          hasChildren
          icon={
            <vaadin-icon icon='vaadin:cog' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          noBorderButton
          onClick={onSettingClick}
          secondaryIconType='page'
          showChildren={showSetting}
          text={t<string>('Settings')}
        >
          <SettingSubMenuFullScreen show={showSetting} />
        </TaskButton>
      </Grid>
      <VersionSocial fontSize='14px' iconSize={20} />
      <ExportAllModal
        open={showExportAll}
        setDisplayPopup={setShowExportAll}
      />
    </Grid>
  );
}
