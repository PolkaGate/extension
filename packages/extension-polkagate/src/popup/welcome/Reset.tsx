// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';

function Reset(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const _goToRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const _goToImport = useCallback(
    (): void => {
      windowOpen('/account/import-seed').catch(console.error);
    }, []
  );

  return (
    <>
      <HeaderBrand
        showBrand
        text={'Polkagate'}
      />
      <Typography sx={{ fontSize: '36px', fontWeight: theme.palette.mode === 'dark' ? 300 : 400, p: '25px 0 10px', textAlign: 'center' }}>
        {t('Reset Wallet')}
      </Typography>
      <Typography sx={{ fontSize: '14px', px: '15px', mb: '25px' }}>
        {t<string>('Resetting your wallet is a last resort option that will erase your current wallet data. Please make sure you have a backup JSON File or a Recovery Phrase before proceeding. To reset your wallet, you can choose one of the following methods:')}
      </Typography>
      <Grid container item sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', m: '10px', p: '10px', width: '95%' }}>
        <Typography sx={{ fontSize: '14px' }}>
          {t<string>('Restore from a previously exported accounts JSON backup file. This file contains the encrypted data of your accounts and can be used to restore them.')}
        </Typography>
        <PButton
          _mt='15px'
          _onClick={_goToRestoreFromJson}
          _variant={'contained'}
          startIcon={
            <vaadin-icon icon='vaadin:file-text' style={{ height: '18px', color: `${theme.palette.text.main}` }} />
          }
          text={t<string>('Restore from JSON File')}
        />
      </Grid>
      <Grid container item sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', m: '10px', p: '10px', width: '95%' }}>
        <Typography sx={{ fontSize: '14px' }}>
          {t<string>('Import from the secret Recovery Phrase. This phrase is a sequence of 12 words that can be used to generate your account.')}
        </Typography>
        <PButton
          _mt='15px'
          _onClick={_goToImport}
          _variant={'contained'}
          startIcon={
            <vaadin-icon icon='vaadin:book' style={{ height: '18px', color: `${theme.palette.text.main}` }} />
          }
          text={t<string>('Import from Recovery Phrase')}
        />
      </Grid>
    </>
  );
}

export default (Reset);
