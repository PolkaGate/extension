// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, Header, PButton, Popup, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  show: boolean;
  setShowAlert: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function Alert({ setShowAlert, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const goHome = useCallback(() => {
    window.localStorage.setItem('export_account_open', Date.now());
    setShowAlert(false);
    onAction('/');
  }, [onAction, setShowAlert]);

  const goToExportAll = useCallback(() => {
    window.localStorage.setItem('export_account_open', 'ok');
    onAction('/account/export-all');
  }, [onAction]);

  return (
    <Popup show={show}>
      <Header onClose={goHome} text={t<string>('Attention!')} />
      <Grid alignItems='center' container height='120px' justifyContent='center'>
        <Warning fontWeight={400} isBelowInput isDanger theme={theme}>
          <Grid item sx={{ fontSize: 19, pb: '20px' }} xs={12}>
            Export Your Account Data Now!
          </Grid>
        </Warning>
      </Grid>
      <Grid container justifyContent='center' sx={{ mt: '20px', px: '15px' }}>
        <Grid item sx={{ textAlign: 'left' }} xs={12}>
          Protect Your Accounts - Export all your data and securely store it in a safe place. Safeguard against potential loss due to browser crashes, hardware failures, or inconsistent updates.
        </Grid>
      </Grid>
      <Grid container justifyContent='center' sx={{ mt: '20px', px: '15px' }}>
        <Grid item sx={{ pt: '15px', textAlign: 'left' }} xs={12}>
          Take Action Now to Ensure the Safety of Your Accounts!
        </Grid>
      </Grid>
      <PButton _onClick={goToExportAll} text={t<string>('Export All Accounts')} />
    </Popup>
  );
}
