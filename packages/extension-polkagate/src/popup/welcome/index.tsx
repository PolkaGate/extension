// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { PButton, VaadinIcon } from '../../components';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { EXTENSION_NAME } from '../../util/constants';
import Privacy from './Privacy';

function Welcome (): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [showPrivacyAndSecurity, setShowPrivacyAndSecurity] = useState(false);

  const onRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const onImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  const onCreate = useCallback(
    (): void => {
      windowOpen('/account/create').catch(console.error);
    }, []
  );

  const onAddWatchOnly = useCallback(
    (): void => {
      windowOpen('/import/add-watch-only-full-screen').catch(console.error);
    }, []
  );

  const onImport = useCallback(
    (): void => {
      windowOpen('/account/import-seed').catch(console.error);
    }, []
  );

  const onImportRawSeed = useCallback(
    (): void => {
      windowOpen('/account/import-raw-seed').catch(console.error);
    }, []
  );

  const onAttachQR = useCallback(
    (): void => {
      windowOpen('/import/attach-qr-full-screen').catch(console.error);
    }, []
  );

  return (
    <>
      <HeaderBrand
        showBrand
        showMenu
        text={EXTENSION_NAME}
      />
      <Typography sx={{ fontSize: '36px', fontWeight: theme.palette.mode === 'dark' ? 300 : 400, pb: '5px', pt: '20px', textAlign: 'center' }}>
        {t('Welcome!')}
      </Typography>
      <Typography sx={{ fontSize: '14px', fontWeight: 400, px: '24px' }}>
        {t('Currently, you do not have any accounts. Begin by creating your first account or importing existing accounts to get started.')}
      </Typography>
      <PButton
        _mt='20px'
        _onClick={onCreate}
        _variant={'contained'}
        startIcon={<VaadinIcon icon='vaadin:plus-circle' style={{ height: '18px' }} />}
        text={t('Create a new account')}
      />
      <Divider sx={{ fontSize: '18px', fontWeight: 300, my: '10px', px: '20px' }}>
        {t('Or')}
      </Divider>
      <PButton
        _mt='0'
        _onClick={onRestoreFromJson}
        _variant={'outlined'}
        text={t('Restore from file')}
      />
      <PButton
        _mt='10px'
        _onClick={onImport}
        _variant={'outlined'}
        text={t('Import from recovery phrase')}
      />
      <PButton
        _mt='10px'
        _onClick={onImportRawSeed}
        _variant={'outlined'}
        text={t('Import from raw seed')}
      />
      <PButton
        _mt='10px'
        _onClick={onAddWatchOnly}
        _variant={'outlined'}
        text={t('Add watch-only account')}
      />
      <PButton
        _mt='10px'
        _onClick={onAttachQR}
        _variant={'outlined'}
        text={t('Attach QR-signer')}
      />
      <PButton
        _mt='10px'
        _onClick={onImportLedger}
        _variant={'outlined'}
        text={t('Attach ledger device')}
      />
      <Grid container justifyContent='center'>
        <Typography onClick={() => setShowPrivacyAndSecurity(true)} sx={{ cursor: 'pointer', fontSize: '12px', bottom: 0, position: 'absolute', textAlign: 'center', textDecoration: 'underline' }}>
          {t('Privacy and Security')}
        </Typography>
      </Grid>
      {showPrivacyAndSecurity &&
        <Privacy
          setShow={setShowPrivacyAndSecurity}
          show={showPrivacyAndSecurity}
        />
      }
    </>
  );
}

export default (Welcome);
