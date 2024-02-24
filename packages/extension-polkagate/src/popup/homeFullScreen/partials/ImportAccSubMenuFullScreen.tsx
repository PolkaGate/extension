// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { ActionContext } from '../../../components';
import { useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { TaskButton } from './HomeMenu';

interface Props {
  toggleSettingSubMenu: () => void;
  show: boolean;
}

function ImportAccSubMenuFullScreen ({ show, toggleSettingSubMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const [notFirstTime, setFirstTime] = useState<boolean>(false);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const slideIn = keyframes`
  0% {
    display: none;
    height: 0;
  }
  100%{
    display: block;
    height: ${settings.camera !== 'on' ? '300px' : '260px'};
  }
`;

  const slideOut = keyframes`
  0% {
    display: block;
    height: ${settings.camera !== 'on' ? '300px' : '260px'};
  }
  100%{
    display: none;
    height: 0;
  }
`;

  useEffect(() => {
    show ? setFirstTime(true) : setTimeout(() => setFirstTime(false), 150);
  }, [show]);

  const _goToRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const _goToImportAcc = useCallback(() => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  const goToAddWatchOnly = useCallback(() => {
    onAction('/import/add-watch-only-full-screen');
  }, [onAction]);

  const _goToAttachQR = useCallback(() => {
    onAction('/import/attach-qr-full-screen');
  }, [onAction]);

  const _goToImportLedger = useCallback((): void => {
    windowOpen('/account/import-ledger').catch(console.error);
  }, []);

  return (
    <Grid container display={notFirstTime ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: show ? '0.3s' : '0.15s', animationFillMode: 'both', animationName: `${show ? slideIn : slideOut}` }}>
      <Grid container direction='column' display='block' item sx={{ p: '0 0 15px 40px' }}>
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:file-text' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={_goToRestoreFromJson}
          text={t<string>('Restore from JSON file')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:book' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={_goToImportAcc}
          text={t<string>('Import from recovery phrase')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:tag' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={goToAddWatchOnly}
          text={t<string>('Add watch-only account')}
        />
        <TaskButton
          borderColor={borderColor}
          disabled={settings.camera !== 'on'}
          extra={settings.camera !== 'on' && <Grid fontSize='12px' item letterSpacing='-1.5%' onClick={toggleSettingSubMenu} sx={{ cursor: 'pointer' }} textAlign='left'>
            {t('Allow QR camera access in the extension’s setting in order to use this feature')}
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 12, mb: '-2px', stroke: '#BA2882' }} />
          </Grid>}
          icon={
            <vaadin-icon icon='vaadin:qrcode' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={_goToAttachQR}
          text={t<string>('Attach external QR-signer')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:wallet' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
          }
          isSubMenu
          onClick={_goToImportLedger}
          text={t<string>('Attach ledger device')}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(ImportAccSubMenuFullScreen);
