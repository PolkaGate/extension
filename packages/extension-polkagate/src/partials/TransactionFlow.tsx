// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { StepCounterType } from '../components/BackWithLabel';
import type { ExtraDetailConfirmationPage, PoolInfo, Proxy, ProxyTypes, TxInfo } from '../util/types';
import type { Content } from './Review';

import { Grid } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { BackWithLabel, Motion } from '../components';
import { useBackground, useTranslation } from '../hooks';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';
import Confirmation2 from './Confirmation2';
import Review from './Review';
import { UserDashboardHeader, WaitScreen2 } from '.';

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
  reviewHeader?: React.ReactNode;
  extraDetailConfirmationPage?: ExtraDetailConfirmationPage;
}

export default function TransactionFlow ({ address, backPathTitle, closeReview, extraDetailConfirmationPage, genesisHash, pool, proxyTypeFilter, restakeReward, reviewHeader, setRestakeReward, showAccountBox, stepCounter, transaction, transactionInformation }: TransactionFlowProps): React.ReactElement {
  useBackground('staking');
  const { t } = useTranslation();

  const [flowStep, setFlowStep] = useState<TransactionFlowStep>(TRANSACTION_FLOW_STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);

  const onOpenProxySelection = useCallback(() => setShowProxySelection(true), []);

  const transactionDetail = useMemo(() => {
    if (!txInfo) {
      return undefined;
    }

    const _txInfo = txInfo;

    const txAmount = transactionInformation.find(({ itemKey }) => itemKey === 'amount');

    if (txAmount?.content) {
      _txInfo.amount = txAmount.content.toString();
    }

    const txFee = transactionInformation.find(({ itemKey }) => itemKey === 'fee');

    if (txFee?.content) {
      _txInfo.fee = txFee.content.toString();
    }

    return { ..._txInfo, ...extraDetailConfirmationPage };
  }, [extraDetailConfirmationPage, transactionInformation, txInfo]);

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
          text={flowStep === TRANSACTION_FLOW_STEPS.REVIEW ? t('Review') : backPathTitle}
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
            transactionInformation={transactionInformation}
          />}
        {flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
          <WaitScreen2 />
        }
        {flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION && transactionDetail &&
          <Confirmation2
            address={address ?? ''}
            close={closeReview}
            genesisHash={genesisHash}
            transactionDetail={transactionDetail}
          />
        }
      </Motion>
    </Grid>
  );
}
