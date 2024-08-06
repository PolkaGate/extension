// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect,useState } from 'react';

import { AuthorizeReqContext } from '../../components';
import { HeaderBrand } from '../../partials';
import { EXTENSION_NAME } from '../../util/constants';
import TransactionIndex from '../signing/TransactionIndex';
import Request from './Request';

export default function AuthExtensionMode (): React.ReactElement {
  const requests = useContext(AuthorizeReqContext);

  const [requestIndex, setRequestIndex] = useState<number>(0);

  useEffect(() => {
    // reset index when the request size changes due to request approve or rejection
    setRequestIndex(0);
  }, [requests.length]);

  const onNextAuth = useCallback(() => {
    setRequestIndex((index) => index < requests.length - 1 ? index + 1 : 0);
  }, [requests.length]);

  const onPreviousAuth = useCallback(() => {
    setRequestIndex((index) => index > 0 ? index - 1 : requests.length - 1);
  }, [requests.length]);

  return (
    <Grid container>
      <HeaderBrand
        showBrand
        text={EXTENSION_NAME}
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
          hasBanner={requests.length > 1}
        />}
    </Grid>
  );
}
