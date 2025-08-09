// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { FullScreenTransactionFlow } from '../../../../fullscreen/stake/util/utils';
import type { Content } from '../../../../partials/Review';
import type { Proxy, ProxyTypes, TxInfo } from '../../../../util/types';

import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { WaitScreen2 } from '../../../../partials';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../../../../util/constants';
import Confirmation from '../../partials/StakingConfirmation';
import Review from './Review';

interface Props {
  address: string | undefined;
  amount: string | undefined;
  closeReview: () => void;
  flowStep: FullScreenTransactionFlow;
  genesisHash: string;
  onClose?: () => void;
  proxyTypeFilter: ProxyTypes[] | undefined;
  selectedProxy: Proxy | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<FullScreenTransactionFlow>>;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  showAccountBox?: boolean;
  showProxySelection: boolean;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transactionInformation: Content[];
}

function EasyStakeTransactionFlow ({ address, amount, closeReview, flowStep, genesisHash, onClose, proxyTypeFilter, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, showAccountBox, showProxySelection, transaction, transactionInformation }: Props): React.ReactElement {
  const navigate = useNavigate();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);

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

    return _txInfo;
  }, [transactionInformation, txInfo]);

  const goToHistory = useCallback(() => navigate('/historyfs') as void, [navigate]);

  return (
    <>
      {TRANSACTION_FLOW_STEPS.REVIEW === flowStep &&
        <Review
          amount={amount}
          closeReview={closeReview}
          genesisHash={genesisHash}
          proxyTypeFilter={proxyTypeFilter}
          selectedProxy={selectedProxy}
          setFlowStep={setFlowStep as React.Dispatch<React.SetStateAction<TransactionFlowStep>>}
          setSelectedProxy={setSelectedProxy}
          setShowProxySelection={setShowProxySelection}
          setTxInfo={setTxInfo}
          showAccountBox={showAccountBox}
          showProxySelection={showProxySelection}
          transaction={transaction}
          transactionInformation={transactionInformation}
        />
      }
      {
        flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
        <WaitScreen2 />
      }
      {flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION && transactionDetail &&
        <Confirmation
          address={address ?? ''}
          backToHome={onClose}
          genesisHash={genesisHash}
          goToHistory={goToHistory}
          transactionDetail={transactionDetail}
        />
      }
    </>
  );
}

export default React.memo(EasyStakeTransactionFlow);
