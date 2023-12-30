// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon, QrCode as QrCodeIcon, UploadFileRounded as UploadJSONIcon, Usb as UsbIcon } from '@mui/icons-material';
import { Divider, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import settings from '@polkadot/ui-settings';

import { ActionContext, MenuItem } from '../components';
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
  const [notFirstTime, setFirstTime] = useState<boolean>(false);

  useEffect(() => {
    show ? setFirstTime(true) : setTimeout(() => setFirstTime(false), 150);
  }, [show]);

  const _goToRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const _goToImportAcc = useCallback(() => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  const _goToAddAddressOnly = useCallback(() => {
    onAction('/import/add-address-only');
  }, [onAction]);

  const _goToAttachQR = useCallback(() => {
    onAction('/import/attach-qr');
  }, [onAction]);

  const _goToImportLedger = useCallback((): void => {
    windowOpen('/account/import-ledger').catch(console.error);
  }, []);

  const slideIn = keyframes`
  0% {
    display: none;
    height: 0;
  }
  100%{
    display: block;
    height: ${settings.camera !== 'on' ? '230px' : '200px'};
  }
`;

  const slideOut = keyframes`
  0% {
    display: block;
    height: ${settings.camera !== 'on' ? '230px' : '200px'};
  }
  100%{
    display: none;
    height: 0;
  }
`;

  return (
    <Grid container display={notFirstTime ? 'inherit' : 'none'} item overflow='hidden' sx={{ animationDuration: show ? '0.3s' : '0.15s', animationFillMode: 'both', animationName: `${show ? slideIn : slideOut}` }}>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid container direction='column' display='block' item sx={{ p: '18px 0 15px 10px' }}>
        <MenuItem
          fontSize='17px'
          iconComponent={
            <vaadin-icon icon='vaadin:file-text' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToRestoreFromJson}
          py='4px'
          text={t('Restore from JSON file')}
        />
        <MenuItem
          fontSize='17px'
          iconComponent={
            <vaadin-icon icon='vaadin:book' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToImportAcc}
          py='4px'
          text={t('Import from recovery phrase')}
        />
        <MenuItem
          fontSize='17px'
          iconComponent={
            <vaadin-icon icon='vaadin:tag' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToAddAddressOnly}
          py='4px'
          text={t('Add watch-only account')}
        />
        <MenuItem
          disabled={settings.camera !== 'on'}
          fontSize='17px'
          iconComponent={
            <vaadin-icon icon='vaadin:qrcode' style={{ height: '18px', color: `${settings.camera === 'on' ? 'theme.palette.text.primary' : 'theme.palette.text.disabled'}` }} />
          }
          onClick={_goToAttachQR}
          py='4px'
          text={t('Attach external QR-signer')}
        />
        {settings.camera !== 'on' &&
          <Grid fontSize='11px' item letterSpacing='-1.5%' onClick={toggleSettingSubMenu} sx={{ cursor: 'pointer' }} textAlign='left'>
            {t('Allow QR camera access in the extension’s setting in order to use this feature')}
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 10, mb: '-2px', stroke: '#BA2882' }} />
          </Grid>
        }
        <MenuItem
          fontSize='17px'
          iconComponent={
            <vaadin-icon icon='vaadin:wallet' style={{ height: '18px', color: `${theme.palette.text.primary}` }} />
          }
          onClick={_goToImportLedger}
          py='4px'
          text={t('Attach ledger device')}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(ImportAccSubMenu);
