// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Typography } from '@mui/material';
import { saveAs } from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext, ActionContext, TwoButtons } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { exportAccounts } from '../../messaging';
import { HeaderBrand, Passwords } from '../../partials';

export default function ExportAll(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

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

          onAction('/');
        })
        .catch((error: Error) => {
          console.error(error);
          setError(error.message);
          setIsBusy(false);
        });
    },
    [accounts, onAction, password]
  );

  return (
    <>
      <HeaderBrand
        onBackClick={_goHome}
        showBackArrow
        text={t('Export All Accounts')}
      />
      <Typography fontSize='14px' fontWeight={300} m='15px auto' textAlign='left' width='88%'>
        {t('All your accounts will be encrypted with a password and stored in a JSON file inside your browser’s download history.')}
      </Typography>
      <Typography fontSize='14px' fontWeight={300} m='5px auto' textAlign='left' width='88%'>
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
        onPrimaryClick={_onExportAllButtonClick}
        onSecondaryClick={_goHome}
        primaryBtnText={t('Export')}
        secondaryBtnText={t('Cancel')}
        width='88%'
      />
    </>
  );
}
