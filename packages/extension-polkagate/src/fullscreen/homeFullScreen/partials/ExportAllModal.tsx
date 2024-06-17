// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import { saveAs } from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext, TwoButtons } from '../../../components';
import { useTranslation } from '../../../hooks';
import { exportAccounts } from '../../../messaging';
import { Passwords } from '../../../partials';
import { DraggableModal } from '../../governance/components/DraggableModal';

interface Props {
  open: boolean;
  setDisplayPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ExportAllModal({ open, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onPassChange = useCallback((pass: string | null) => {
    setPassword(pass || '');
    setError('');
  }, []);

  const _onExportAllButtonClick = useCallback(
    (): void => {
      setIsBusy(true);

      exportAccounts(accounts.map((account) => account.address), password)
        .then(({ exportedJson }) => {
          const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

          saveAs(blob, `batch_exported_account_${Date.now()}.json`);

          setDisplayPopup(false);
        })
        .catch((error: Error) => {
          console.error(error);
          setError(error.message);
          setIsBusy(false);
        });
    },
    [accounts, password, setDisplayPopup]
  );

  const onCancel = useCallback(() => setDisplayPopup(false), [setDisplayPopup]);

  return (
    <DraggableModal minHeight={500} onClose={onCancel} open={open}>
      <Grid container item>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid alignItems='flex-start' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
            <Grid item>
              <vaadin-icon icon='vaadin:download' style={{ height: '25px', color: `${theme.palette.text.primary}`, width: '25px' }} />
            </Grid>
            <Grid item sx={{ pl: '10px' }}>
              <Typography fontSize='22px' fontWeight={700}>
                {t('Export All Accounts')}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <CloseIcon onClick={onCancel} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Typography fontSize='16px' m='25px auto' textAlign='left' width='88%'>
          {t('All your accounts will be encrypted with a password and stored in a JSON file inside your browser’s download history.')}
        </Typography>
        <Typography fontSize='16px' m='5px auto' textAlign='left' width='88%'>
          {t('You can later use this JSON file to import your accounts into the extension using the provided password.')}
        </Typography>
        <Passwords
          label={t('Create a password')}
          onChange={onPassChange}
          onEnter={_onExportAllButtonClick}
        />
        <TwoButtons
          disabled={!password || !!error}
          isBusy={isBusy}
          ml='0'
          mt='125px'
          onPrimaryClick={_onExportAllButtonClick}
          onSecondaryClick={onCancel}
          primaryBtnText={t('Export')}
          secondaryBtnText={t('Cancel')}
          width='100%'
        />
      </Grid>
    </DraggableModal>
  );
}
