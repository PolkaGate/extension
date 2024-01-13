// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AuthorizeReqContext } from '../../components';
import { HeaderBrand } from '../../partials';
import TransactionIndex from '../signing/TransactionIndex';
import Request from './Request';

export default function Authorize (): React.ReactElement {
  const requests = useContext(AuthorizeReqContext);

  const [requestIndex, setRequestIndex] = useState<number>(0);

  useEffect(() => {
    if (requests.length > 0 && requestIndex > requests.length - 1) {
      setRequestIndex(0);
    }
  }, [requestIndex, requests, requests.length]);

  const onNextAuth = useCallback(() => {
    if (requestIndex >= 0 && requestIndex < requests.length - 1) {
      setRequestIndex((requestIndex) => requestIndex + 1);
    }
  }, [requestIndex, requests.length]);

  const onPreviousAuth = useCallback(() => {
    if (requestIndex > 0 && requestIndex <= requests.length - 1) {
      setRequestIndex((requestIndex) => requestIndex - 1);
    }
  }, [requestIndex, requests.length]);

  return (
    <Grid container>
      <HeaderBrand
        showBrand
        text={'Polkagate'}
      />
      {requests.length > 1 &&
        <TransactionIndex
          index={requestIndex}
          onNextClick={onNextAuth}
          onPreviousClick={onPreviousAuth}
          totalItems={requests.length}
        />}
      {requests[requestIndex] &&
        <Request
          authRequest={requests[requestIndex]}
        />}
    </Grid>
  );
}
