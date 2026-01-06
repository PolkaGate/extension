// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { Box, Grid, Stack, Typography } from '@mui/material';
import saveAs from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';

import { exportAccounts } from '@polkadot/extension-polkagate/src/messaging';

import { exportAccountsGif } from '../../assets/gif';
import { AccountContext, DecisionButtons, MatchPasswordField, MySnackbar } from '../../components';
import { useTranslation } from '../../hooks';
import { DraggableModal } from '../components/DraggableModal';

interface Props {
  onClose: ExtensionPopupCloser;
}

/**
 * Modal component to export all accounts as an encrypted JSON file.
 * Prompts for a password, then saves the file and shows a notification.
 *
 * Only has been used in full-screen mode!
 */
function ExportAllAccounts({ onClose }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [password, setPassword] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const onSnackbarClose = useCallback(() => {
    setShowSnackbar(false);
    onClose();
  }, [onClose]);

  const onExport = useCallback(async (): Promise<void> => {
    if (!password) {
      return;
    }

    setIsBusy(true);

    try {
      const { exportedJson } = await exportAccounts(accounts.map((account) => account.address), password);
      const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

      saveAs(blob, `batch_exported_account_${Date.now()}.json`);

      setShowSnackbar(true);
      setIsBusy(false);
    } catch (error) {
      console.error(error);
      setShowSnackbar(true);
      setIsBusy(false);
      setError(error instanceof Error ? error.message : String(error));
    }
  }, [accounts, password, setShowSnackbar]);

  return (
    <DraggableModal
      dividerStyle={{ margin: '5px 0 0' }}
      onClose={onClose}
      open
      showBackIconAsClose
      style={{ minHeight: '200px' }}
      title={t('Export all Accounts')}
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', px: '5px', zIndex: 1 }}>
        <Stack columnGap='15px' direction='column' sx={{ m: '10px 15px 0' }}>
          <Box component='img' src={exportAccountsGif as string} sx={{ alignSelf: 'center', width: '100px' }} />
          <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', m: '5px 15px' }} textAlign='center' variant='B-4'>
            {t('All your accounts will be encrypted with a password and stored in a JSON file inside your browser’s download history.')}
          </Typography>
          <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', m: '10px 15px' }} textAlign='center' variant='B-4'>
            {t('You can later use this JSON file to import your accounts into the extension using the provided password.')}
          </Typography>
          <MatchPasswordField
            focused
            onSetPassword={onExport}
            setConfirmedPassword={setPassword}
            style={{ marginTop: '25px' }}
            title1={t('Create a password')}
            title2={t('Repeat the password')}
          />
          <DecisionButtons
            cancelButton
            direction='vertical'
            disabled={!password}
            isBusy={isBusy}
            onPrimaryClick={onExport}
            onSecondaryClick={onClose}
            primaryBtnText={t('Export')}
            secondaryBtnText={t('Cancel')}
            style={{ marginTop: '25px', width: '100%' }}
          />
        </Stack>
        <MySnackbar
          isError={!!error}
          onClose={onSnackbarClose}
          open={showSnackbar}
          text={error ?? t('Account export is completed!')}
        />
      </Grid>
    </DraggableModal>
  );
}

export default React.memo(ExportAllAccounts);
