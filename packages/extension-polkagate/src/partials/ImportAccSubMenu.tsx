// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Divider, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import settings from '@polkadot/ui-settings';

import { connect, connectB } from '../assets/icons';
import { ActionContext, MenuItem } from '../components';
import { useTranslation } from '../hooks';
import { windowOpen } from '../messaging';

interface Props {
  toggleSettingSubMenu: () => void
}

function ImportAccSubMenu({ toggleSettingSubMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const _goToRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const _goToImportAcc = useCallback(
    () => {
      onAction('/account/import-seed');
    }, [onAction]
  );

  const _goToAddAddressOnly = useCallback(
    () => {
      onAction('/import/add-address-only');
    }, [onAction]
  );

  const _goToAttachQR = useCallback(
    () => {
      onAction('/import/attach-qr');
    }, [onAction]
  );

  const _goToImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  const slide = keyframes`
  0% {
    transform: translateY(-200px);
  }
  100%{
    transform: translateY(0);
  }
`;

  return (
    <Grid container display='block' item overflow='hidden'>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid container direction='column' sx={{ animationDuration: '0.3s', animationFillMode: 'forwards', animationName: `${slide}`, p: '18px 0 15px 10px' }}>
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:cloud-upload-o' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToRestoreFromJson}
          py='4px'
          text={t('Restore from JSON file')}
        />
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:key' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToImportAcc}
          py='4px'
          text={t('Import from mnemonic')}
        />
        <MenuItem
          iconComponent={
            <vaadin-icon icon='vaadin:sitemap' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToAddAddressOnly}
          py='4px'
          text='Add address only'
        />
        <MenuItem
          disabled={settings.camera !== 'on'}
          iconComponent={<vaadin-icon icon='vaadin:qrcode' style={{ height: '18px', width: '18px', color: `${settings.camera === 'on' ? theme.palette.mode === 'dark' ? 'white' : 'black' : 'theme.palette.text.disabled'}` }} />}
          onClick={_goToAttachQR}
          py='4px'
          text='Attach external QR-signer '
        />
        {settings.camera !== 'on' &&
          <Grid fontSize='10px' item letterSpacing='-1.5%' onClick={toggleSettingSubMenu} sx={{ cursor: 'pointer' }} textAlign='left'>
            {t('Allow QR camera access in the extension’s setting in order to use this feature')}
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 10, mb: '-2px', stroke: '#BA2882' }} />
          </Grid>
        }
        <MenuItem
          icon={theme.palette.mode === 'light' ? connectB : connect}
          onClick={_goToImportLedger}
          py='4px'
          text='Attach ledger device'
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(ImportAccSubMenu);
