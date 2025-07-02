// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy } from '../../../../util/types';

import React, { useCallback, useState } from 'react';

import { SelectedProxy } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { Review } from '../../../../popup/staking/pool-new';
import { useWithdrawClaimPool } from '../../../../util/api';
import { DraggableModal } from '../../../components/DraggableModal';
import TransactionFlow from '../../partials/TransactionFlow';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, getCloseBehavior } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
  open: boolean;
}

export default function Withdraw ({ address, genesisHash, onClose, open }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { transactionInformation, tx } = useWithdrawClaimPool(address, genesisHash, Review.Withdraw);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.REVIEW);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const handleClosePopup = useCallback(() => {
    onClose();
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
  }, [onClose]);

  const { onClose: handler, showCloseIcon } = getCloseBehavior(flowStep, handleClosePopup, setFlowStep);

  return (
    <DraggableModal
      RightItem={
        selectedProxy && genesisHash &&
        <SelectedProxy
          genesisHash={genesisHash}
          signerInformation={{
            onClick: () => setShowProxySelection(true),
            selectedProxyAddress
          }}
        />
      }
      maxHeight={605}
      minHeight={605}
      noCloseButton={showCloseIcon === undefined}
      onClose={handler}
      open={open}
      showBackIconAsClose={!showCloseIcon}
      title={t('Withdraw redeemable')}
    >
      {tx && genesisHash
        ? (
          <TransactionFlow
            address={address}
            closeReview={handler}
            flowStep={flowStep}
            genesisHash={genesisHash}
            proxyTypeFilter={[]}
            selectedProxy={selectedProxy}
            setFlowStep={setFlowStep}
            setSelectedProxy={setSelectedProxy}
            setShowProxySelection={setShowProxySelection}
            showProxySelection={showProxySelection}
            transaction={tx}
            transactionInformation={transactionInformation}
          />)
        : <></>}
    </DraggableModal>
  );
}
