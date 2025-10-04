// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Content } from '../../../../../partials/Review';
import type { Proxy, ProxyTypes, TxInfo } from '../../../../../util/types';
import type { FullScreenTransactionFlow } from '../../../util/utils';
import type { RestakeRewardTogglerProps } from './RestakeRewardToggler';

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTransactionData } from '../../../../../hooks';
import { WaitScreen } from '../../../../../partials';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../../../../../util/constants';
import Confirmation from '../../../partials/StakingConfirmation';
import Review from './Review';

interface Props extends RestakeRewardTogglerProps {
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

function ClaimRewardsTransactionFlow ({ address, amount, closeReview, flowStep, genesisHash, onClose, proxyTypeFilter, restake, selectedProxy, setFlowStep, setRestake, setSelectedProxy, setShowProxySelection, showAccountBox, showProxySelection, transaction, transactionInformation }: Props): React.ReactElement {
  const navigate = useNavigate();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);

  const { transactionDetail, txInformation } = useTransactionData(address, genesisHash, selectedProxy?.delegate, txInfo, transactionInformation, undefined, amount);

  const goToHistory = useCallback(() => navigate('/historyfs') as void, [navigate]);

  return (
    <>
      {TRANSACTION_FLOW_STEPS.REVIEW === flowStep &&
        <Review
          amount={amount}
          closeReview={closeReview}
          genesisHash={genesisHash}
          proxyTypeFilter={proxyTypeFilter}
          restake={restake}
          selectedProxy={selectedProxy}
          setFlowStep={setFlowStep as React.Dispatch<React.SetStateAction<TransactionFlowStep>>}
          setRestake={setRestake}
          setSelectedProxy={setSelectedProxy}
          setShowProxySelection={setShowProxySelection}
          setTxInfo={setTxInfo}
          showAccountBox={showAccountBox}
          showProxySelection={showProxySelection}
          transaction={transaction}
          transactionInformation={txInformation}
        />
      }
      {
        flowStep === TRANSACTION_FLOW_STEPS.WAIT_SCREEN &&
        <WaitScreen />
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

export default React.memo(ClaimRewardsTransactionFlow);
