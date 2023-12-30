// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthorizeRequest } from '@polkadot/extension-base/background/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, ButtonWithCancel, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import { approveAuthRequest, rejectAuthRequest } from '../../messaging';

interface Props {
  authRequest: AuthorizeRequest;
}

export default function Request ({ authRequest }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const _onApprove = useCallback((): void => {
    approveAuthRequest(authRequest.id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [authRequest.id, onAction]);

  const _onReject = useCallback((): void => {
    rejectAuthRequest(authRequest.id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [authRequest.id, onAction]);

  return (
    <Grid container justifyContent='center'>
      <Typography fontSize='20px' fontWeight={400} pt='35px' textAlign='center'>
        {t<string>('Authorize')}
      </Typography>
      <Warning theme={theme}>
        <span style={{ overflowWrap: 'anywhere' }}>
          {t<string>('An application, self-identifying as ')}
          <strong style={{ fontWeight: 400, textDecoration: 'underline' }}>
            {authRequest.request.origin}
          </strong>
          {t<string>(' is requesting access from ')}
          <strong style={{ fontWeight: 400, textDecoration: 'underline' }}>
            {authRequest.url}
          </strong>
        </span>
      </Warning>
      <Typography fontSize='14px' fontWeight={300} m='20px auto 0' width='90%'>
        {t<string>('only approve this request if you trust the application. Approving gives the application access to the addresses of your accounts.')}
      </Typography>
      <ButtonWithCancel
        _onClick={_onApprove}
        _onClickCancel={_onReject}
        cancelText={t<string>('Reject')}
        text={t<string>('Allow')}
      />
    </Grid>
  );
}
