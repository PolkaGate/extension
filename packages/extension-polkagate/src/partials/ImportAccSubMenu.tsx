// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import settings from '@polkadot/ui-settings';

import { ActionContext, MenuItem, VaadinIcon } from '../components';
import { useTranslation } from '../hooks';
import { windowOpen } from '../messaging';

interface Props {
  toggleSettingSubMenu: () => void;
  show: boolean;
}

function ImportAccSubMenu({ show, toggleSettingSubMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const onRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const onImportAcc = useCallback(() => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  const onImportRawSeed = useCallback(() => {
    windowOpen('/account/import-raw-seed').catch(console.error);
  }, []);

  const onAddWatchOnly = useCallback(() => {
    onAction('/import/add-watch-only');
  }, [onAction]);

  const onAttachQR = useCallback(() => {
    onAction('/import/attach-qr');
  }, [onAction]);

  const onImportLedger = useCallback((): void => {
    windowOpen('/account/import-ledger').catch(console.error);
  }, []);

  const onImportProxied = useCallback((): void => {
    onAction('/import/proxied');
  }, [onAction]);

  return (
    <Collapse easing={{ enter: '200ms', exit: '100ms' }} in={show} sx={{ width: '100%' }}>
      <Grid container item justifyContent='flex-end'>
        <Divider sx={{ bgcolor: 'divider', height: '1px', mr: '10px', width: '83%' }} />
        <Grid container direction='column' display='block' item sx={{ p: '10px', pr: 0 }}>
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:file-text' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onRestoreFromJson}
            py='4px'
            text={t('Restore from JSON file')}
            withHoverEffect
          />
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:book' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onImportAcc}
            py='4px'
            text={t('Import from recovery phrase')}
            withHoverEffect
          />
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:book-dollar' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onImportRawSeed}
            py='4px'
            text={t('Import from raw seed')}
            withHoverEffect
          />
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:cluster' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onImportProxied}
            py='4px'
            text={t('Import proxied account(s)')}
            withHoverEffect
          />
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:tag' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onAddWatchOnly}
            py='4px'
            text={t('Add watch-only account')}
            withHoverEffect
          />
          <MenuItem
            disabled={settings.camera !== 'on'}
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:qrcode' style={{ height: '18px', color: `${settings.camera === 'on' ? 'theme.palette.text.primary' : 'theme.palette.text.disabled'}` }} />
            }
            onClick={onAttachQR}
            py='4px'
            text={t('Attach external QR-signer')}
            withHoverEffect
          />
          {settings.camera !== 'on' &&
            <Grid fontSize='11px' item letterSpacing='-1.5%' onClick={toggleSettingSubMenu} sx={{ cursor: 'pointer' }} textAlign='left'>
              {t('Allow QR camera access in the extension’s setting in order to use this feature')}
              <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 10, mb: '-2px', stroke: theme.palette.secondary.light }} />
            </Grid>
          }
          <MenuItem
            fontSize='17px'
            iconComponent={
              <VaadinIcon icon='vaadin:wallet' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
            }
            onClick={onImportLedger}
            py='4px'
            text={t('Attach ledger device')}
            withHoverEffect
          />
        </Grid>
      </Grid>
    </Collapse>
  );
}

export default React.memo(ImportAccSubMenu);
