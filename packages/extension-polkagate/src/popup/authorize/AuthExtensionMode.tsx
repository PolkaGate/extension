// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthorizeRequest } from '@polkadot/extension-base/background/types';

import { Grid } from '@mui/material';
import React from 'react';

import { HeaderBrand } from '../../partials';
import { EXTENSION_NAME } from '../../util/constants';
import TransactionIndex from '../signing/TransactionIndex';
import Request from './Request';

interface Props {
  onNextAuth: () => void;
  onPreviousAuth: () => void
  requestIndex: number;
  requests: AuthorizeRequest[];
}

export default function AuthExtensionMode({ onNextAuth, onPreviousAuth, requestIndex, requests }: Props): React.ReactElement {
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
