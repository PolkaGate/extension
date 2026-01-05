// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { StepCounterType } from '../components/BackWithLabel';
import type { ExtraDetailConfirmationPage, PoolInfo, Proxy, ProxyTypes, TxInfo } from '../util/types';
import type { Content } from './Review';

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { BackWithLabel, Motion } from '../components';
import { useBackground, useTransactionData, useTranslation } from '../hooks';
import { PROCESSING_TITLE, TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';
import Review from './Review';
import { Confirmation, UserDashboardHeader, WaitScreen } from '.';

export interface TransactionFlowProps {
  closeReview: () => void;
  genesisHash: string;
  transactionInformation: Content[];
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  backPathTitle: string;
  stepCounter: StepCounterType;
  proxyTypeFilter: ProxyTypes[] | undefined;
  address: string | undefined;
  pool: PoolInfo | undefined;
  restakeReward?: boolean;
  setRestakeReward?: React.Dispatch<React.SetStateAction<boolean>>;
  showAccountBox?: boolean;
  showStakingHome?: boolean;
  reviewHeader?: React.ReactNode;
  extraDetailConfirmationPage?: ExtraDetailConfirmationPage;
}

export default function TransactionFlow({ address, backPathTitle, closeReview, extraDetailConfirmationPage, genesisHash, pool, proxyTypeFilter, restakeReward, reviewHeader, setRestakeReward, showAccountBox, showStakingHome, stepCounter, transaction, transactionInformation }: TransactionFlowProps): React.ReactElement {
  useBackground('staking');
  const { t } = useTranslation();

  const [flowStep, setFlowStep] = useState<TransactionFlowStep>(TRANSACTION_FLOW_STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);

  const onOpenProxySelection = useCallback(() => setShowProxySelection(true), []);

  const { transactionDetail, txInformation } = useTransactionData(address, genesisHash, selectedProxy?.delegate, txInfo, transactionInformation, extraDetailConfirmationPage);

  return (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative', width: '100%' }}>
      <UserDashboardHeader
        genesisHash={genesisHash}
        homeType='default'
        noSelection
        signerInformation={{
          onClick: onOpenProxySelection,
          selectedProxyAddress: selectedProxy?.delegate
        }}
      />
      <Motion style={{ height: 'calc(100% - 50px)' }} variant='slide'>
        <BackWithLabel
          onClick={closeReview}
          stepCounter={stepCounter}
          style={{ pb: 0 }}
          text={
            flowStep === TRANSACTION_FLOW_STEPS.REVIEW
              ? t('Review')
              : flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN
                ? t(PROCESSING_TITLE)
                : backPathTitle
          }
        />
        {flowStep === TRANSACTION_FLOW_STEPS.REVIEW &&
          <Review
            amount={extraDetailConfirmationPage?.amount}
            closeReview={closeReview}
            genesisHash={genesisHash}
            pool={pool}
            proxyTypeFilter={proxyTypeFilter}
            restakeReward={restakeReward}
            reviewHeader={reviewHeader}
            selectedProxy={selectedProxy}
            setFlowStep={setFlowStep}
            setRestakeReward={setRestakeReward}
            setSelectedProxy={setSelectedProxy}
            setShowProxySelection={setShowProxySelection}
            setTxInfo={setTxInfo}
            showAccountBox={showAccountBox}
            showProxySelection={showProxySelection}
            transaction={transaction}
            transactionInformation={txInformation}
          />}
        {flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION && transactionDetail &&
          <Confirmation
            address={address ?? ''}
            genesisHash={genesisHash}
            onClose={closeReview}
            showStakingHome={showStakingHome}
            transactionDetail={transactionDetail}
          />
        }
      </Motion>
    </Grid>
  );
}
