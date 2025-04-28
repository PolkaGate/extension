// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionFlowProps } from '../partials/TransactionFlow';

import React from 'react';

import TransactionFlow from '../partials/TransactionFlow';

interface UseTransactionFlowProps extends TransactionFlowProps {
  review: boolean;
}

export default function useTransactionFlow ({ backPathTitle, closeReview, genesisHash, review, transactionInformation, tx }: UseTransactionFlowProps) {
  if (!review) {
    return null;
  }

  return (
    <TransactionFlow
      backPathTitle={backPathTitle}
      closeReview={closeReview}
      genesisHash={genesisHash}
      transactionInformation={transactionInformation}
      tx={tx}
    />
  );
}
