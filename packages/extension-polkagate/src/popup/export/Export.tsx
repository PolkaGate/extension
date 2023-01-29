// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import { saveAs } from 'file-saver';
import React, { useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext, Address, ButtonWithCancel, Password, Warning, WrongPasswordAlert } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { exportAccount } from '../../messaging';
import { HeaderBrand } from '../../partials';

export default function Export(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [pass, setPass] = useState<string>('');
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);

  const _goHome = useCallback(
    () => onAction('/'),
    [onAction]
  );

  const onPassChange = useCallback(
    (password: string | null) => {
      setPass(password || '');
      setIsPasswordError(false);
    }
    , []);

  const _onExportButtonClick = useCallback(
    (): void => {
      setIsBusy(true);

      exportAccount(address, pass)
        .then(({ exportedJson }) => {
          const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json; charset=utf-8' });

          saveAs(blob, `${address}.json`);

          onAction('/');
        })
        .catch((err: Error) => {
          console.error(err);
          setIsPasswordError(true);
          setIsBusy(false);
        });
    },
    [address, onAction, pass]
  );

  return (
    <>
      <HeaderBrand
        onBackClick={_goHome}
        showBackArrow
        text={t<string>('Export Account')}
      />
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      <Address
        address={address}
        showCopy
      />
      <Grid display='inline-flex' ml='6%' width='88%'>
        <FontAwesomeIcon
          className='warningImage'
          icon={faExclamationTriangle}
        />
        <Typography fontSize='14px' fontWeight={300} pl='10px' textAlign='left'>
          {t<string>('You are exporting your account. Keep it safe and don’t share it with anyone.')}
        </Typography>
      </Grid>
      <Grid sx={{ m: '20px auto', width: '92%' }}>
        <Password
          isError={isPasswordError}
          label={t<string>('Password for this account')}
          onChange={onPassChange}
          onEnter={_onExportButtonClick}
        />
        {isPasswordError && (
          <Warning
            isBelowInput
            isDanger
            theme={theme}
          >
            {t<string>('incorrect password')}
          </Warning>
        )}
      </Grid>
      <ButtonWithCancel
        _isBusy={isBusy}
        _onClick={_onExportButtonClick}
        _onClickCancel={_goHome}
        disabled={pass.length === 0 || !!isPasswordError}
        text={t<string>('Export')}
      />
    </>
  );
}
