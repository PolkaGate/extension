// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';

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

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const onRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const onImportFromSeed = useCallback(() => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  const onAddWatchOnlyFullScreen = useCallback(() => {
    onAction('/import/add-watch-only-full-screen');
  }, [onAction]);

  const onAttachQrFullScreen = useCallback(() => {
    onAction('/import/attach-qr-full-screen');
  }, [onAction]);

  const onImportLedger = useCallback((): void => {
    windowOpen('/account/import-ledger').catch(console.error);
  }, []);

  return (
    <Grid container item overflow='hidden'>
      <Collapse in={show} sx={{ width: '100%' }}>
        <Grid container direction='column' display='block' item sx={{ p: '0 0 15px 40px' }}>
          <TaskButton
            borderColor={borderColor}
            icon={
              <vaadin-icon icon='vaadin:file-text' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onRestoreFromJson}
            text={t<string>('Restore from JSON file')}
          />
          <TaskButton
            borderColor={borderColor}
            icon={
              <vaadin-icon icon='vaadin:book' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onImportFromSeed}
            text={t<string>('Import from recovery phrase')}
          />
          <TaskButton
            borderColor={borderColor}
            icon={
              <vaadin-icon icon='vaadin:tag' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onAddWatchOnlyFullScreen}
            text={t<string>('Add watch-only account')}
          />
          <TaskButton
            borderColor={borderColor}
            disabled={settings.camera !== 'on'}
            extra={settings.camera !== 'on'
              ? <Grid fontSize='12px' item letterSpacing='-1.5%' onClick={toggleSettingSubMenu} sx={{ cursor: 'pointer' }} textAlign='left'>
                {t('Allow QR camera access in the extension’s setting in order to use this feature')}
                <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 12, mb: '-2px', stroke: '#BA2882' }} />
              </Grid>
              : undefined
            }
            icon={
              <vaadin-icon icon='vaadin:qrcode' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onAttachQrFullScreen}
            text={t<string>('Attach external QR-signer')}
          />
          <TaskButton
            borderColor={borderColor}
            icon={
              <vaadin-icon icon='vaadin:wallet' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onImportLedger}
            text={t<string>('Attach ledger device')}
          />
        </Grid>
      </Collapse>
    </Grid>
  );
}

export default React.memo(ImportAccSubMenuFullScreen);
