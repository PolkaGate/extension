// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthorizeRequest } from '@polkadot/extension-base/background/types';

import { Avatar, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { AccountContext, AccountsTable, ActionContext, ButtonWithCancel, Warning } from '../../components';
import { useFavIcon, useTranslation } from '../../hooks';
import { approveAuthRequest, rejectAuthRequest } from '../../messaging';
import { areArraysEqual, extractBaseUrl } from '../../util/utils';

interface Props {
  authRequest: AuthorizeRequest;
  hasBanner: boolean;
}

export default function Request ({ authRequest, hasBanner }: Props): React.ReactElement<Props> {
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
          {extractBaseUrl(authRequest.url)}
        </span>
      </Grid>
      <Grid container item sx={{ m: '10px 20px' }}>
        <Typography fontSize='14px' fontWeight={300}>
          {t('The application is requesting access to your accounts. Please select the accounts you wish to connect.')}
        </Typography>
      </Grid>
      <AccountsTable
        areAllCheck={areAllCheck}
        maxHeight= { hasBanner ? '150px' : '170px'}
        selectedAccounts={selectedAccounts}
        setSelectedAccounts={setSelectedAccounts}
        style={{
          m: 'auto',
          width: '90%'
        }}
      />
      <Grid container item sx={{ '>div': { margin: '10px auto 0' } }}>
        <Warning theme={theme}>
          <Typography fontSize='14px' fontWeight={300} width='90%'>
            {t('Allow this request only if you trust the application. This grants access to your account addresses.')}
          </Typography>
        </Warning>
      </Grid>
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
