// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Content } from '../partials/Review';

import React from 'react';

import TransactionFlow from '../partials/TransactionFlow';

interface UseTransactionFlowProps {
  review: boolean;
  genesisHash: string;
  transactionInformation: Content[];
  tx: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  backPathTitle: string;
  closeReview: () => void;
  stepCount: number;
}

export default function useTransactionFlow ({ backPathTitle, closeReview, genesisHash, review, stepCount, transactionInformation, tx }: UseTransactionFlowProps) {
  if (!review || !tx) {
    return null;
  }

  return (
    <TransactionFlow
      backPathTitle={backPathTitle}
      closeReview={closeReview}
      genesisHash={genesisHash}
      stepCount={stepCount}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
