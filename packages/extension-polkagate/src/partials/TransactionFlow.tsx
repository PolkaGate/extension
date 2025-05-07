// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { StepCounterType } from '../components/BackWithLabel';
import type { Proxy, ProxyTypes, TxInfo } from '../util/types';
import type { Content } from './Review';

import { Grid } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { isBn } from '@polkadot/util';

import { BackWithLabel, Motion } from '../components';
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
  formatted: string | undefined;
}

export enum TRANSACTION_FLOW_STEPS {
  REVIEW,
  WAIT_SCREEN,
  CONFIRMATION
}

export default function TransactionFlow ({ backPathTitle, closeReview, formatted, genesisHash, proxyTypeFilter, stepCounter, transaction, transactionInformation }: TransactionFlowProps): React.ReactElement {
  const [flowStep, setFlowStep] = useState<TRANSACTION_FLOW_STEPS>(TRANSACTION_FLOW_STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);

  const onOpenProxySelection = useCallback(() => setShowProxySelection(true), []);

  const transactionDetail = useMemo(() => {
    if (!txInfo) {
      return undefined;
    }

    const _txInfo = txInfo;

    // The first item is always amount or the reward destination account address,
    // So by checking that if it is a BN number we can retrieve the amount value
    if (isBn(transactionInformation[0].content)) {
      _txInfo.amount = transactionInformation[0].content.toString();
    }

    // The second item of this array is always the fee amount
    if (isBn(transactionInformation[1].content)) {
      _txInfo.fee = transactionInformation[1].content.toString();
    }

    return _txInfo;
  }, [transactionInformation, txInfo]);

  console.log('transactionDetail:', transactionDetail);

  return (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative', width: '100%' }}>
      <UserDashboardHeader
        genesisHash={genesisHash}
        homeType='default'
        noAccountSelected
        signerInformation={{
          onClick: onOpenProxySelection,
          selectedProxy
        }}
      />
      <Motion style={{ height: 'calc(100% - 50px)' }} variant='slide'>
        <BackWithLabel
          onClick={closeReview}
          stepCounter={stepCounter}
          style={{ pb: 0 }}
          text={backPathTitle}
        />
        {flowStep === TRANSACTION_FLOW_STEPS.REVIEW &&
          <Review
            genesisHash={genesisHash}
            proxyTypeFilter={proxyTypeFilter}
            selectedProxy={selectedProxy}
            setFlowStep={setFlowStep}
            setSelectedProxy={setSelectedProxy}
            setShowProxySelection={setShowProxySelection}
            setTxInfo={setTxInfo}
            showProxySelection={showProxySelection}
            transaction={transaction}
            transactionInformation={transactionInformation}
          />}
        {flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
          <WaitScreen2 />
        }
        {flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION && transactionDetail &&
          <Confirmation2
            address={formatted ?? ''}
            genesisHash={genesisHash}
            transactionDetail={transactionDetail}
          />
        }
      </Motion>
    </Grid>
  );
}
