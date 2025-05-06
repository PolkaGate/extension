// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, Typography } from '@mui/material';
import saveAs from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';

import { exportAccounts } from '@polkadot/extension-polkagate/src/messaging';
import MySnackbar from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/components/MySnackbar';

import { exportAccountsGif } from '../../assets/gif';
import { AccountContext, DecisionButtons, MatchPasswordField } from '../../components';
import { useTranslation } from '../../hooks';
import { DraggableModal } from '../components/DraggableModal';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<any | undefined>>;
  open: any | undefined;
}

function ExportAllAccounts ({ open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [password, setPassword] = useState<string>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  console.log('password', password);
  const onCurrentPasswordChange = useCallback((pass: string | null): void => {
    setPassword(pass || '');
  }, []);

  const onClose = useCallback(() => setPopup(undefined), [setPopup]);
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
      exportAccounts(accounts.map((account) => account.address), password)
        .then(({ exportedJson }) => {
          const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

          saveAs(blob, `batch_exported_account_${Date.now()}.json`);

          setShowSnackbar(true);
          setIsBusy(false);
        })
        .catch((error: Error) => {
          console.error(error);
          setShowSnackbar(true);
          setError(error.message);
          setIsBusy(false);
        });
    } catch (error) {
      console.error(error);
      setShowSnackbar(true);
      setIsBusy(false);
      setError(error.message);
    }
  }, [accounts, password, setShowSnackbar]);

  return (
    <DraggableModal
      dividerStyle={{ margin: '5px 0 0' }}
      onClose={onClose}
      open={open !== undefined}
      style={{ minHeight: '200px' }}
      title={t('Export all Accounts')}
    >
      <Grid container item justifyContent='center' sx={{ p: '0 5px 10px', position: 'relative', zIndex: 1 }}>
        <Stack columnGap='15px' direction='column' sx={{ m: '10px 15px' }}>
          <Box component='img' src={exportAccountsGif as string} sx={{ alignSelf: 'center', width: '100px' }} />
          <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', m: '5px 15px' }} textAlign='center' variant='B-4'>
            {t('All your accounts will be encrypted with a password and stored in a JSON file inside your browser’s download history.')}
          </Typography>
          <Typography color='#BEAAD8' sx={{ lineHeight: '16.8px', m: '10px 15px' }} textAlign='center' variant='B-4'>
            {t('You can later use this JSON file to import your accounts into the extension using the provided password.')}
          </Typography>
          <MatchPasswordField
            focused
            onSetPassword={onCurrentPasswordChange}
            setConfirmedPassword={onCurrentPasswordChange}
            style={{ marginTop: '20px' }}
            title1={t('Create a Password')}
            title2={t('Repeat the Password')}
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
