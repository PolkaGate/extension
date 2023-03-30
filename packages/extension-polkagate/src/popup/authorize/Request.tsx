// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestAuthorizeTab } from '@polkadot/extension-base/background/types';

import { Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, ButtonWithCancel, PButton, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import { approveAuthRequest, rejectAuthRequest } from '../../messaging';

interface Props {
  authId: string;
  isFirst: boolean;
  request: RequestAuthorizeTab;
  url: string;
}

export default function Request({ authId, isFirst, request: { origin }, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const _onApprove = useCallback(
    (): void => {
      approveAuthRequest(authId)
        .then(() => onAction())
        .catch((error: Error) => console.error(error));
    },
    [authId, onAction]
  );

  const _onReject = useCallback(
    (): void => {
      rejectAuthRequest(authId)
        .then(() => onAction())
        .catch((error: Error) => console.error(error));
    },
    [authId, onAction]
  );

  return (
    <>
      <Typography
        fontSize='20px'
        fontWeight={400}
        pt='35px'
        textAlign='center'
      >
        {t<string>('Authorize')}
      </Typography>
      <Warning theme={theme}>
        <span style={{ overflowWrap: 'anywhere' }}>{t<string>('An application, self-identifying as ')}<strong style={{ fontWeight: 400, textDecoration: 'underline' }}>{origin}</strong>{t<string>(' is requesting access from ')}<strong style={{ fontWeight: 400, textDecoration: 'underline' }}>{url}</strong></span>
      </Warning>
      <Typography
        fontSize='14px'
        fontWeight={300}
        m='20px auto 0'
        width='90%'
      >
        {t<string>('only approve this request if you trust the application. Approving gives the application access to the addresses of your accounts.')}
      </Typography>
      {
        isFirst
          ? (
            <ButtonWithCancel
              _onClick={_onApprove}
              _onClickCancel={_onReject}
              cancelText={t<string>('Reject')}
              text={t<string>('Allow')}
            />
          )
          : (
            <PButton
              _onClick={_onReject}
              _variant='outlined'
              text={t<string>('Reject')}
            />
          )
      }
    </>
  );
}
