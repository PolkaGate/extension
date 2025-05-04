// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy, TxInfo } from '../util/types';
import type { Content } from './Review';

import { Grid } from '@mui/material';
import React, { useState } from 'react';

import { BackWithLabel, Motion } from '../components';
import Review from './Review';
import { UserDashboardHeader } from '.';

export interface TransactionFlowProps {
  closeReview: () => void;
  genesisHash: string;
  transactionInformation: Content[];
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  backPathTitle: string;
  stepCount: number;
}

export enum TRANSACTION_FLOW_STEPS {
  REVIEW,
  WAIT_SCREEN,
  CONFIRMATION
}

export default function TransactionFlow ({ backPathTitle, closeReview, genesisHash, stepCount, transaction, transactionInformation }: TransactionFlowProps): React.ReactElement {
  const [flowStep, setFlowStep] = useState<TRANSACTION_FLOW_STEPS>(TRANSACTION_FLOW_STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
        <UserDashboardHeader homeType='default' noAccountSelected />
        <Motion style={{ height: 'calc(100% - 50px)' }} variant='slide'>
          <BackWithLabel
            onClick={closeReview}
            style={{ pb: 0 }}
            text={backPathTitle}
          />
          {flowStep === TRANSACTION_FLOW_STEPS.REVIEW &&
            <Review
              genesisHash={genesisHash}
              selectedProxy={selectedProxy}
              setFlowStep={setFlowStep}
              setSelectedProxy={setSelectedProxy}
              setTxInfo={setTxInfo}
              transaction={transaction}
              transactionInformation={transactionInformation}
            />}
        </Motion>
      </Grid>
    </>
  );
}
