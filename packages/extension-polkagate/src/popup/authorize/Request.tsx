// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthorizeRequest } from '@polkadot/extension-base/background/types';

import { Avatar, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { AccountContext, AccountsTable, ActionContext, ButtonWithCancel, Warning } from '../../components';
import { useFavIcon, useTranslation } from '../../hooks';
import { approveAuthRequest, rejectAuthRequest } from '../../messaging';
import { areArraysEqual } from '../../util/utils';

interface Props {
  authRequest: AuthorizeRequest;
}

export default function Request ({ authRequest }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const faviconUrl = useFavIcon(authRequest.url);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const allAccounts = useMemo(() => accounts.map(({ address }) => address), [accounts]);
  const areAllCheck = useMemo(() => areArraysEqual([allAccounts, selectedAccounts]), [allAccounts, selectedAccounts]);

  const onApprove = useCallback((): void => {
    approveAuthRequest(selectedAccounts, authRequest.id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [authRequest.id, onAction, selectedAccounts]);

  const onReject = useCallback((): void => {
    rejectAuthRequest(authRequest.id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [authRequest.id, onAction]);

  return (
    <Grid container justifyContent='center'>
      <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '5px', columnGap: '10px', m: '10px auto', p: '10px 10px', width: '90%' }}>
        <Avatar
          src={faviconUrl ?? undefined}
          sx={{ borderRadius: '50%', height: '30px', width: '30px' }}
          variant='circular'
        />
        <span style={{ fontSize: '15px', fontWeight: 400, overflowWrap: 'anywhere' }}>
          {authRequest.url}
        </span>
      </Grid>
      <Grid container item sx={{ '>div': { marginBottom: '15px', marginTop: '10px' } }}>
        <Warning theme={theme}>
          <span style={{ overflowWrap: 'anywhere' }}>
            {t('The application is requesting access to your accounts. Please select the accounts you wish to connect.')}
          </span>
        </Warning>
      </Grid>
      <AccountsTable
        areAllCheck={areAllCheck}
        maxHeight='170px'
        selectedAccounts={selectedAccounts}
        setSelectedAccounts={setSelectedAccounts}
        style={{
          m: 'auto',
          width: '90%'
        }}
      />
      <Typography fontSize='14px' fontWeight={300} m='10px auto 0' width='90%'>
        {t('only approve this request if you trust the application. Approving gives the application access to the addresses of your accounts.')}
      </Typography>
      <ButtonWithCancel
        _onClick={onApprove}
        _onClickCancel={onReject}
        cancelText={t('Reject')}
        disabled={selectedAccounts.length === 0}
        text={t('Allow')}
      />
    </Grid>
  );
}
