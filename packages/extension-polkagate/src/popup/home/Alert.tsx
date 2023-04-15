// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext } from 'react';
import { Grid, useTheme } from '@mui/material';

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
      <Grid container justifyContent="center" alignItems="center" height="120px" width="90%">
        <Warning fontWeight={400} isBelowInput isDanger theme={theme}>
          <Grid item xs={12} sx={{ pb: '20px', fontSize: 20 }}>
            Export Your Account Data!
          </Grid>
        </Warning>
      </Grid>
      <Grid container justifyContent="center" sx={{ px: '15px', mt: '20px' }}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          Protect your accounts - Export all your data and keep it in a safe place. Safeguard against potential loss due to browser crashes or inconsistent updates.
        </Grid>
      </Grid>
      <Grid container justifyContent="center" sx={{ px: '15px', mt: '20px' }}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          Take action now to keep your accounts safe!
        </Grid>
      </Grid>
      <PButton _onClick={goToExportAll} text={t<string>('Export All Accounts')} />
    </Popup>
  );
}
