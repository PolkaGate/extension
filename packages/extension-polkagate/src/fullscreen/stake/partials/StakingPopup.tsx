// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Content } from '../../../partials/Review';
import type { PoolInfo, Proxy } from '../../../util/types';

import React, { useCallback, useState } from 'react';

import { SelectedProxy } from '../../../components';
import { DraggableModal } from '../../../fullscreen/components/DraggableModal';
import TransactionFlow from '../partials/TransactionFlow';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, getCloseBehavior } from '../util/utils';

interface Props {
  address: string | undefined;
  title: string;
  genesisHash: string | undefined;
  onClose: () => void;
  children?: React.ReactElement;
  setValue?: React.Dispatch<React.SetStateAction<BN | null | undefined>>;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  transactionInformation: Content[];
  maxHeight?: number;
  minHeight?: number;
  setFlowStep: React.Dispatch<React.SetStateAction<FullScreenTransactionFlow>>;
  flowStep: FullScreenTransactionFlow;
  pool?: PoolInfo | undefined;
  style?: React.CSSProperties;
  _onClose?: () => void;
  _showCloseIcon?: boolean | undefined;
}

export default function StakingPopup ({ _onClose, _showCloseIcon, address, children, flowStep, genesisHash, maxHeight, minHeight, onClose, pool, setFlowStep, setValue, style, title, transaction, transactionInformation }: Props) {
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const closeReview = useCallback(() => {
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
    setValue?.(undefined);
  }, [setFlowStep, setValue]);
  const handleClosePopup = useCallback(() => {
    onClose();
    closeReview();
  }, [closeReview, onClose]);

  const { onClose: handler, showCloseIcon } = getCloseBehavior(flowStep, handleClosePopup, setFlowStep, !!children);

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
      maxHeight={maxHeight ?? 605}
      minHeight={ flowStep === FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN ? 270 : minHeight ?? 605}
      noCloseButton={showCloseIcon === undefined}
      onClose={_onClose ?? handler}
      open
      showBackIconAsClose={_showCloseIcon !== undefined ? !_showCloseIcon : !showCloseIcon}
      style={style}
      title={title}
    >
      {flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE && children
        ? children
        : transaction && genesisHash
          ? (
            <TransactionFlow
              address={address}
              closeReview={closeReview}
              flowStep={flowStep}
              genesisHash={genesisHash}
              pool={pool}
              proxyTypeFilter={[]}
              selectedProxy={selectedProxy}
              setFlowStep={setFlowStep}
              setSelectedProxy={setSelectedProxy}
              setShowProxySelection={setShowProxySelection}
              showProxySelection={showProxySelection}
              transaction={transaction}
              transactionInformation={transactionInformation}
            />)
          : <></>
      }
    </DraggableModal>
  );
}
