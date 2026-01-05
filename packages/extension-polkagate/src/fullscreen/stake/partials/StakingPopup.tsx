// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Content } from '../../../partials/Review';
import type { ExtraDetailConfirmationPage, PoolInfo, Proxy, ProxyTypes } from '../../../util/types';

import React, { useCallback, useState } from 'react';

import { PROCESSING_TITLE } from '@polkadot/extension-polkagate/src/util/constants';

import { Progress, SelectedProxy } from '../../../components';
import { DraggableModal, type DraggableModalProps } from '../../../fullscreen/components/DraggableModal';
import { useRouteRefresh, useTranslation } from '../../../hooks';
import TransactionFlow from '../partials/TransactionFlow';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, getCloseBehavior } from '../util/utils';

interface Props extends Partial<DraggableModalProps>{
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
  showBack?: boolean | undefined;
  proxyTypeFilter: ProxyTypes[] | undefined;
  extraDetailConfirmationPage?: ExtraDetailConfirmationPage;
  reviewHeader?: React.ReactNode;
  showAccountBoxInReview?: boolean;
}

export default function StakingPopup ({ _onClose, address, children, extraDetailConfirmationPage, flowStep, genesisHash, maxHeight, minHeight, onClose, pool, proxyTypeFilter, reviewHeader, setFlowStep, setValue, showAccountBoxInReview, showBack, style, title, transaction, transactionInformation, ...rest }: Props) {
  const { t } = useTranslation();
  const refresh = useRouteRefresh();

  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>(undefined);
  const [showProxySelection, setShowProxySelection] = useState<boolean>(false);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const closeReview = useCallback(() => {
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
    setValue?.(undefined);
  }, [setFlowStep, setValue]);

  const closeModal = useCallback(() => {
    onClose();
    closeReview();
    flowStep === FULLSCREEN_STAKING_TX_FLOW.CONFIRMATION && refresh();
  }, [closeReview, flowStep, onClose, refresh]);

  const { onClose: handler, showCloseIcon } = getCloseBehavior(flowStep, closeModal, setFlowStep, !!children);

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
      maxHeight={maxHeight ?? 700}
      minHeight={ flowStep === FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN ? 270 : minHeight ?? 605}
      noCloseButton={showCloseIcon === undefined}
      {...rest}
      onClose={_onClose ?? handler}
      open
      showBackIconAsClose={showBack ?? !showCloseIcon}
      style={style}
      title={flowStep === FULLSCREEN_STAKING_TX_FLOW.WAIT_SCREEN ? t(PROCESSING_TITLE) : title}
    >
      {flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE && children
        ? children
        : transaction && genesisHash
          ? (
            <TransactionFlow
              address={address}
              closeReview={closeReview}
              extraDetailConfirmationPage={extraDetailConfirmationPage}
              flowStep={flowStep}
              genesisHash={genesisHash}
              onClose={closeModal}
              pool={pool}
              proxyTypeFilter={proxyTypeFilter}
              reviewHeader={reviewHeader}
              selectedProxy={selectedProxy}
              setFlowStep={setFlowStep}
              setSelectedProxy={setSelectedProxy}
              setShowProxySelection={setShowProxySelection}
              showAccountBox={showAccountBoxInReview}
              showProxySelection={showProxySelection}
              transaction={transaction}
              transactionInformation={transactionInformation}
            />)
          : (
            <Progress
              style={{ paddingTop: '50px' }}
              title = {t('Loading, please wait')}
              withEllipsis
            />)
      }
    </DraggableModal>
  );
}
