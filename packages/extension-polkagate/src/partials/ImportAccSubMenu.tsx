// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext } from '../../../extension-ui/src/components';
import { connect, connectB, key, keyB, qr, qrB, restore, restoreB, sitemap, sitemapB } from '../assets/icons';
import { MenuItem } from '../components';
import useTranslation from '../hooks/useTranslation';
import { windowOpen } from '../messaging';

interface Props {
  className?: string;
}

export default function ImportAccSubMenu({ className }: Props): React.ReactElement<Props> {
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

  const _goToAttachQR = useCallback(
    () => {
      onAction('/account/attach-qr');
    }, [onAction]
  );

  const _goToImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  return (
    <>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid
        container
        direction='column'
        sx={{ p: '18px 0 15px 10px' }}
      >
        <MenuItem
          Icon={theme.palette.mode === 'light' ? restoreB : restore}
          onClick={_goToRestoreFromJson}
          py='4px'
          text={t('Restore from JSON file')}
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? keyB : key}
          onClick={_goToImportAcc}
          py='4px'
          text={t('Import from Mnemonic')}
        // onClick={}
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? qrB : qr}
          py='4px'
          text='Attach external QR-signer '
          onClick={_goToAttachQR}
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? connectB : connect}
          py='4px'
          text='Connect ledger device'
          onClick={_goToImportLedger}
        />
        <MenuItem
          Icon={theme.palette.mode === 'light' ? sitemapB : sitemap}
          py='4px'
          text='Add proxied address'
        // onClick={ }
        />
      </Grid>
    </>
  );
}
