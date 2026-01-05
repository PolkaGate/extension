// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { StepCounterType } from '../components/BackWithLabel';
import type { Content } from '../partials/Review';
import type { ExtraDetailConfirmationPage, PoolInfo, ProxyTypes } from '../util/types';

import React from 'react';

import TransactionFlow from '../partials/TransactionFlow';

interface UseTransactionFlowProps {
  review: boolean;
  genesisHash: string;
  transactionInformation: Content[];
  tx: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  backPathTitle: string;
  closeReview: () => void;
  stepCounter: StepCounterType;
  proxyTypeFilter?: ProxyTypes[] | undefined;
  address: string | undefined;
  pool?: PoolInfo | undefined;
  restakeReward?: boolean;
  setRestakeReward?: React.Dispatch<React.SetStateAction<boolean>>;
  showAccountBox?: boolean;
  reviewHeader?: React.ReactNode;
  extraDetailConfirmationPage?: ExtraDetailConfirmationPage;
  showStakingHome?: boolean;
}

export default function useTransactionFlow ({ address, backPathTitle, closeReview, extraDetailConfirmationPage, genesisHash, pool, proxyTypeFilter, restakeReward, review, reviewHeader, setRestakeReward, showAccountBox, showStakingHome = true, stepCounter, transactionInformation, tx }: UseTransactionFlowProps) {
  if (!review || !tx) {
    return null;
  }

  return (
    <TransactionFlow
      address={address}
      backPathTitle={backPathTitle}
      closeReview={closeReview}
      extraDetailConfirmationPage={extraDetailConfirmationPage}
      genesisHash={genesisHash}
      pool={pool}
      proxyTypeFilter={proxyTypeFilter}
      restakeReward={restakeReward}
      reviewHeader={reviewHeader}
      setRestakeReward={setRestakeReward}
      showAccountBox={showAccountBox}
      showStakingHome={showStakingHome}
      stepCounter={stepCounter}
      transaction={tx}
      transactionInformation={transactionInformation}
    />
  );
}
