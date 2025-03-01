// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Grid, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import settings from '@polkadot/ui-settings';

import { VaadinIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import { TaskButton } from './HomeMenu';

interface Props {
  toggleSettingSubMenu: () => void;
  show: boolean;
}

function ImportAccSubMenuFullScreen({ show, toggleSettingSubMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const onRestoreFromJson = useCallback((): void => {
    openOrFocusTab('/account/restore-json');
  }, []);

  const onImportFromSeed = useCallback(() => {
    openOrFocusTab('/account/import-seed');
  }, []);

  const onImportFromRawSeed = useCallback(() => {
    openOrFocusTab('/account/import-raw-seed');
  }, []);

  const onAddWatchOnlyFullScreen = useCallback(() => {
    openOrFocusTab('/import/add-watch-only-full-screen');
  }, []);

  const onImportProxiedFullScreen = useCallback(() => {
    openOrFocusTab('/import/proxied-full-screen');
  }, []);

  const onAttachQrFullScreen = useCallback(() => {
    openOrFocusTab('/import/attach-qr-full-screen');
  }, []);

  const onImportLedger = useCallback((): void => {
    openOrFocusTab('/account/import-ledger');
  }, []);

  return (
    <Grid container item overflow='hidden'>
      <Collapse in={show} sx={{ width: '100%' }}>
        <Grid container direction='column' display='block' item sx={{ p: '0 0 15px 40px' }}>
          <TaskButton
            icon={
              <VaadinIcon icon='vaadin:file-text' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onRestoreFromJson}
            text={t('Restore from JSON file')}
          />
          <TaskButton
            icon={
              <VaadinIcon icon='vaadin:book' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onImportFromSeed}
            text={t('Import from recovery phrase')}
          />
          <TaskButton
            icon={
              <VaadinIcon icon='vaadin:book-dollar' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onImportFromRawSeed}
            text={t('Import from raw seed')}
          />
          <TaskButton
            icon={
              <VaadinIcon icon='vaadin:cluster' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onImportProxiedFullScreen}
            text={t('Import proxied account(s)')}
          />
          <TaskButton
            icon={
              <VaadinIcon icon='vaadin:tag' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onAddWatchOnlyFullScreen}
            text={t('Add watch-only account')}
          />
          <TaskButton
            disabled={settings.camera !== 'on'}
            extra={settings.camera !== 'on'
              ? <Grid fontSize='12px' item letterSpacing='-1.5%' ml='19.5%' onClick={toggleSettingSubMenu} sx={{ cursor: 'pointer' }} textAlign='left'>
                {t('Allow QR camera access in the extension’s setting in order to use this feature')}
                <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 12, mb: '-2px', stroke: theme.palette.secondary.light }} />
              </Grid>
              : undefined
            }
            icon={
              <VaadinIcon icon='vaadin:qrcode' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onAttachQrFullScreen}
            text={t('Attach external QR-signer')}
          />
          <TaskButton
            icon={
              <VaadinIcon icon='vaadin:wallet' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            }
            isSubMenu
            onClick={onImportLedger}
            text={t('Attach ledger device')}
          />
        </Grid>
      </Collapse>
    </Grid>
  );
}

export default React.memo(ImportAccSubMenuFullScreen);
