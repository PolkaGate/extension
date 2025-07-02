// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api-base/types/submittable';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { FullScreenTransactionFlow } from '../../../fullscreen/stake/util/utils';
import type { Proxy, ProxyTypes, TxInfo } from '../../../util/types';

import React, { useMemo, useState } from 'react';

import { isBn } from '@polkadot/util';

import { WaitScreen2 } from '../../../partials';
import Review, { type Content } from '../../../partials/Review';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../../../util/constants';
import Confirmation from './StakingConfirmation';

interface Props {
  address: string | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<FullScreenTransactionFlow>>;
  proxyTypeFilter: ProxyTypes[] | undefined;
  closeReview: () => void;
  flowStep: FullScreenTransactionFlow;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  genesisHash: string;
  transactionInformation: Content[];
  showAccountBox?: boolean;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  showProxySelection: boolean;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
}

function TransactionFlow ({ address, closeReview, flowStep, genesisHash, proxyTypeFilter, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, showAccountBox, showProxySelection, transaction, transactionInformation }: Props): React.ReactElement {
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>(undefined);

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

  return (
    <>
      {TRANSACTION_FLOW_STEPS.REVIEW === flowStep &&
        <Review
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
      {
        flowStep === TRANSACTION_FLOW_STEPS.CONFIRMATION && transactionDetail &&
        <Confirmation
          address={address ?? ''}
          genesisHash={genesisHash}
          transactionDetail={transactionDetail}
        />
      }
    </>
  );
}

export default React.memo(TransactionFlow);
