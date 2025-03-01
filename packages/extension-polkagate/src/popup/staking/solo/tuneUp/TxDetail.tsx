// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../../util/types';

import React from 'react';

import { AccountWithProxyInConfirmation } from '../../../../components';

interface Props {
  txInfo: TxInfo;
}

export default function TxDetail({ txInfo }: Props): React.ReactElement {
  return (
    <AccountWithProxyInConfirmation
      txInfo={txInfo}
    />
  );
}
