// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerPayloadJSON } from '@polkadot/types/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ActionContext, Header, Loading, SigningReqContext, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { cancelSignRequest } from '../../messaging';
import Request from './Request';
import TransactionIndex from './TransactionIndex';

export default function Signing(): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(SigningReqContext);
  const [requestIndex, setRequestIndex] = useState(0);
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const [error, setError] = useState<string | null>(null);

  const _onNextClick = useCallback(
    () => setRequestIndex((requestIndex) => requestIndex + 1),
    []
  );

  const _onPreviousClick = useCallback(
    () => setRequestIndex((requestIndex) => requestIndex - 1),
    []
  );

  useEffect(() => {
    setRequestIndex(
      (requestIndex) => requestIndex < requests.length
        ? requestIndex
        : requests.length - 1
    );
  }, [requests]);

  // protect against removal overflows/underflows
  const request = requests.length !== 0
    ? requestIndex >= 0
      ? requestIndex < requests.length
        ? requests[requestIndex]
        : requests[requests.length - 1]
      : requests[0]
    : null;
  const isTransaction = !!((request?.request?.payload as SignerPayloadJSON)?.blockNumber);

  const _onCancel = useCallback((): void => {
    if (!request?.id) {
      return;
    }

    cancelSignRequest(request.id)
      .then(() => onAction())
      .catch((error: Error) => console.error(error));
  }, [onAction, request?.id]);

  return request
    ? (
      <>
        <Header onClose={_onCancel} text={isTransaction ? t<string>('Transaction') : t<string>('Sign message')} />
        {error &&
          <Grid
            color='red'
            height='30px'
            m='auto'
            py='10px'
            width='92%'
          >
            <Warning
              fontWeight={400}
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('You’ve used an incorrect password. Try again.')}
            </Warning>
          </Grid>
        }
        {requests.length > 1 && (
          <TransactionIndex
            index={requestIndex}
            onNextClick={_onNextClick}
            onPreviousClick={_onPreviousClick}
            totalItems={requests.length}
          />
        )}
        {request.account &&
          <Request
            account={request.account}
            buttonText={isTransaction ? t('Sign the transaction') : t('Sign the message')}
            error={error}
            isFirst={requestIndex === 0}
            request={request.request}
            setError={setError}
            signId={request.id}
            url={request.url}
          />
        }
      </>
    )
    : <Loading />;
}
