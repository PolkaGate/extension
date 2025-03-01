// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { noop } from '@polkadot/util';

import { AccountContext, VaadinIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import VersionSocial from '../../../partials/VersionSocial';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import ExportAllModal from './ExportAllModal';
import ImportAccSubMenuFullScreen from './ImportAccSubMenuFullScreen';
import SettingSubMenuFullScreen from './SettingSubMenuFullScreen';

interface TaskButtonProps {
  icon: React.JSX.Element;
  text: string;
  onClick: () => void;
  secondaryIconType?: 'popup' | 'page';
  noBorderButton?: boolean;
  disabled?: boolean;
  hasChildren?: boolean;
  showChildren?: boolean;
  children?: React.ReactElement;
  extra?: React.ReactElement;
  isSubMenu?: boolean;
}

export const TaskButton = ({ children, disabled, extra, hasChildren, icon, isSubMenu, noBorderButton = false, onClick, secondaryIconType, showChildren, text }: TaskButtonProps) => {
  const theme = useTheme();

  return (
    <>
      <Grid alignItems='center' container item justifyContent='space-between' onClick={disabled ? noop : onClick} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : 'divider' }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', minHeight: isSubMenu ? '40px' : '41px', p: '5px 0px 5px 10px', my: '5px' }}>
        <Grid container item xs={2}>
          {icon}
        </Grid>
        <Grid container item justifyContent='left' xs>
          <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
            {text}
          </Typography>
        </Grid>
        {secondaryIconType === 'page' &&
          <Grid alignItems='center' container item justifyContent='flex-end' xs={1}>
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1, transform: hasChildren ? showChildren ? 'rotate(-90deg)' : 'rotate(90deg)' : 'rotate(0deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
          </Grid>
        }
      </Grid>
      {extra}
      <Grid container item justifyContent='flex-end'>
        {!noBorderButton &&
          <Divider sx={{ bgcolor: 'divider', height: '2px', width: '81%' }} />
        }
      </Grid>
      {children}
    </>
  );
};

export default function HomeMenu(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts, master } = useContext(AccountContext);

  const [showImport, setShowImport] = useState<boolean>(false);
  const [showSetting, setShowSetting] = useState<boolean>(false);
  const [showExportAll, setShowExportAll] = useState<boolean>(false);

  const areAllExternalAccounts = useMemo(() => accounts.every(({ isExternal }) => isExternal), [accounts]);

  const onCreate = useCallback(() => {
    openOrFocusTab('/account/create');
  }, []);

  const onExportAll = useCallback(() => {
    !areAllExternalAccounts && setShowExportAll(true);
  }, [areAllExternalAccounts]);

  const onImportClick = useCallback(() => {
    setShowImport(!showImport);
    setShowSetting(false);
  }, [showImport]);

  const onSettingClick = useCallback(() => {
    setShowSetting(!showSetting);
    setShowImport(false);
  }, [showSetting]);

  const onDeriveFromAccounts = useCallback(() => {
    if (!areAllExternalAccounts && master) {
      openOrFocusTab(`/derivefs/${master.address}`);
    }
  }, [areAllExternalAccounts, master]);

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px', width: '430px', position: 'relative' }}>
      <Grid alignItems='center' container direction='column' display='block' item justifyContent='center' sx={{ pb: '40px' }}>
        <TaskButton
          icon={
            <VaadinIcon icon='vaadin:plus-circle' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          onClick={onCreate}
          secondaryIconType='page'
          text={t('Create new account')}
        />
        <TaskButton
          disabled={areAllExternalAccounts}
          icon={
            <VaadinIcon icon='vaadin:road-branch' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          onClick={onDeriveFromAccounts}
          secondaryIconType='page'
          text={t('Derive from accounts')}
        />
        <TaskButton
          hasChildren
          icon={
            <VaadinIcon float={showImport} icon='vaadin:upload-alt' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          onClick={onImportClick}
          secondaryIconType='page'
          showChildren={showImport}
          text={t('Import account')}
        >
          <ImportAccSubMenuFullScreen show={showImport} toggleSettingSubMenu={onSettingClick} />
        </TaskButton>
        <TaskButton
          disabled={areAllExternalAccounts}
          icon={
            <VaadinIcon icon='vaadin:download' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          onClick={onExportAll}
          secondaryIconType='popup'
          text={t('Export all accounts')}
        />
        <TaskButton
          hasChildren
          icon={
            <VaadinIcon icon='vaadin:cog' spin={showSetting} style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          noBorderButton
          onClick={onSettingClick}
          secondaryIconType='page'
          showChildren={showSetting}
          text={t('Settings')}
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
