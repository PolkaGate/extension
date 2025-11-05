// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SxProps, Theme } from '@mui/material';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { FullScreenTransactionFlow } from '../../../fullscreen/stake/util/utils';
import type { ExtraDetailConfirmationPage, PoolInfo, Proxy, ProxyTypes, TxInfo } from '../../../util/types';

import React, { useState } from 'react';

import { useTransactionData } from '../../../hooks';
import { Confirmation, WaitScreen } from '../../../partials';
import Review, { type Content } from '../../../partials/Review';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../../../util/constants';

interface Props {
  address: string | undefined;
  closeReview: () => void;
  flowStep: FullScreenTransactionFlow;
  genesisHash: string;
  onClose?: () => void;
  pool?: PoolInfo | undefined;
  proxyTypeFilter: ProxyTypes[] | undefined;
  selectedProxy: Proxy | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<FullScreenTransactionFlow>>;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  showAccountBox?: boolean;
  showProxySelection: boolean;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transactionInformation: Content[];
  extraDetailConfirmationPage?: ExtraDetailConfirmationPage;
  reviewHeader?: React.ReactNode;
  reviewStyle?: SxProps<Theme>;
}

function TransactionFlow ({ address, closeReview, extraDetailConfirmationPage, flowStep, genesisHash, onClose, pool, proxyTypeFilter, reviewHeader, reviewStyle, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, showAccountBox, showProxySelection, transaction, transactionInformation }: Props): React.ReactElement {
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);

  const { transactionDetail, txInformation } = useTransactionData(address, genesisHash, selectedProxy?.delegate, txInfo, transactionInformation, extraDetailConfirmationPage);

  return (
    <>
      {TRANSACTION_FLOW_STEPS.REVIEW === flowStep &&
        <Review
          closeReview={closeReview}
          genesisHash={genesisHash}
          pool={pool}
          proxyTypeFilter={proxyTypeFilter}
          reviewHeader={reviewHeader}
          selectedProxy={selectedProxy}
          setFlowStep={setFlowStep as React.Dispatch<React.SetStateAction<TransactionFlowStep>>}
          setSelectedProxy={setSelectedProxy}
          setShowProxySelection={setShowProxySelection}
          setTxInfo={setTxInfo}
          showAccountBox={showAccountBox}
          showProxySelection={showProxySelection}
          style={reviewStyle}
          transaction={transaction}
          transactionInformation={txInformation}
        />
      }
      {
        flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
        <WaitScreen />
      }
      {
        flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION && transactionDetail &&
        <Confirmation
          address={address ?? ''}
          backToHome={onClose}
          genesisHash={genesisHash}
          transactionDetail={transactionDetail}
        />
      }
    </>
  );
}

export default React.memo(TransactionFlow);
