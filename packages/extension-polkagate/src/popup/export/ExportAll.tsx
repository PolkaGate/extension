// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Typography } from '@mui/material';
import { saveAs } from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';

import { AccountContext, ActionContext, ButtonWithCancel } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { exportAccounts } from '../../messaging';
import { HeaderBrand, Passwords } from '../../partials';

export default function ExportAll (): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [pass, setPass] = useState<string>('');
  const [error, setError] = useState<string>('');

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  const onPassChange = useCallback(
    (password: string | null) => {
      setPass(password || '');
      setError('');
    }
    , []);

  const _onExportAllButtonClick = useCallback(
    (): void => {
      setIsBusy(true);

      exportAccounts(accounts.map((account) => account.address), pass)
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
    [accounts, onAction, pass]
  );

  return (
    <>
      <HeaderBrand
        onBackClick={_goHome}
        showBackArrow
        text={t<string>('Export All Accounts')}
      />
      <Typography fontSize='14px' fontWeight={300} m='15px auto' textAlign='left' width='88%'>
        {t<string>('All your accounts will be encrypted with a password and stored in a JSON file.')}
      </Typography>
      <Typography fontSize='14px' fontWeight={300} m='5px auto' textAlign='left' width='88%'>
        {t<string>('You can later use this JSON file to import your accounts into the extension using the provided password.')}
      </Typography>
      <Passwords
        label={t<string>('Create a password')}
        onChange={onPassChange}
        onEnter={_onExportAllButtonClick}
      />
      <ButtonWithCancel
        _isBusy={isBusy}
        _onClick={_onExportAllButtonClick}
        _onClickCancel={_goHome}
        disabled={!pass || !!error}
        text={t<string>('Export')}
      />
    </>
  );
}
