// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import Privacy from './Privacy';

function Welcome(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const [showPrivacyAndSecurity, setShowPrivacyAndSecurity] = useState(false);

  const _goToRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const _goToImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  const _goToCreate = useCallback(
    (): void => {
      windowOpen('/account/create').catch(console.error);
    }, []
  );

  const _goToAddAddressOnly = useCallback(
    () => onAction('/import/add-address-only'),
    [onAction]
  );

  const _goToImport = useCallback(
    (): void => {
      windowOpen('/account/import-seed').catch(console.error);
    }, []
  );

  const _goToAttachQR = useCallback(
    () => onAction('/import/attach-qr'),
    [onAction]
  );

  return (
    <>
      <HeaderBrand
        showBrand
        showMenu
        text={'Polkagate'}
      />
      <Typography sx={{ fontSize: '36px', fontWeight: theme.palette.mode === 'dark' ? 300 : 400, pb: '20px', pt: '25px', textAlign: 'center' }}>
        {t('Welcome!')}
      </Typography>
      <Typography sx={{ fontSize: '14px', fontWeight: 400, px: '24px' }}>
        {t<string>('Currently, you do not have any accounts. Begin by creating your first account or importing existing accounts to get started.')}
      </Typography>
      <PButton
        _mt='20px'
        _onClick={_goToCreate}
        _variant={'contained'}
        startIcon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '18px', color: `${theme.palette.text.main}` }} />}
        text={t<string>('Create a new account')}
      />
      <Typography sx={{ fontSize: '18px', fontWeight: 300, py: '10px', textAlign: 'center' }}>
        {t<string>('Or')}
      </Typography>
      <PButton
        _mt='0'
        _onClick={_goToRestoreFromJson}
        _variant={'outlined'}
        text={t<string>('Restore from file')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToImport}
        _variant={'outlined'}
        text={t<string>('Import from recovery phrase')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToAddAddressOnly}
        _variant={'outlined'}
        text={t<string>('Add watch-only account')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToAttachQR}
        _variant={'outlined'}
        text={t<string>('Attach QR-signer')}
      />
      <PButton
        _mt='10px'
        _onClick={_goToImportLedger}
        _variant={'outlined'}
        text={t<string>('Attach ledger device')}
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
