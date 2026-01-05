// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { Content } from '../../../../../partials/Review';
import type { Proxy, ProxyTypes } from '../../../../../util/types';
import type { RestakeRewardTogglerProps } from './RestakeRewardToggler';

import React, { useCallback, useState } from 'react';

import { Progress, SelectedProxy } from '../../../../../components';
import { useRouteRefresh, useTranslation } from '../../../../../hooks';
import { DraggableModal, type DraggableModalProps } from '../../../../components/DraggableModal';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow, getCloseBehavior } from '../../../util/utils';
import ClaimRewardsTransactionFlow from './ClaimRewardsTransactionFlow';

interface Props extends Partial<DraggableModalProps>, RestakeRewardTogglerProps {
  address: string | undefined;
  amount: string | undefined;
  title: string;
  genesisHash: string | undefined;
  onClose: () => void;
  children?: React.ReactElement;
  setValue?: React.Dispatch<React.SetStateAction<BN | null | undefined>>;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  transactionInformation: Content[];
  setFlowStep: React.Dispatch<React.SetStateAction<FullScreenTransactionFlow>>;
  flowStep: FullScreenTransactionFlow;
  style?: React.CSSProperties;
  _onClose?: () => void;
  showBack?: boolean | undefined;
  proxyTypeFilter: ProxyTypes[] | undefined;
}

export default function ClaimRewardsPopup ({ _onClose, address, amount, children, flowStep, genesisHash, onClose, proxyTypeFilter, restake, setFlowStep, setRestake, setValue, showBack, style, title, transaction, transactionInformation, ...rest }: Props) {
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
      maxHeight={700}
      minHeight={270}
      noCloseButton={showCloseIcon === undefined}
      {...rest}
      onClose={_onClose ?? handler}
      open
      showBackIconAsClose={showBack ?? !showCloseIcon}
      style={style}
      title={title}
    >
      {flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE && children
        ? children
        : transaction && genesisHash
          ? (
            <ClaimRewardsTransactionFlow
              address={address}
              amount={amount}
              closeReview={closeModal}
              flowStep={flowStep}
              genesisHash={genesisHash}
              onClose={closeModal}
              proxyTypeFilter={proxyTypeFilter}
              restake={restake}
              selectedProxy={selectedProxy}
              setFlowStep={setFlowStep}
              setRestake={setRestake}
              setSelectedProxy={setSelectedProxy}
              setShowProxySelection={setShowProxySelection}
              showProxySelection={showProxySelection}
              transaction={transaction}
              transactionInformation={transactionInformation}
            />)
          : (
            <Progress
              style={{ paddingTop: '50px' }}
              title={t('Loading, please wait')}
              withEllipsis
            />)
      }
    </DraggableModal>
  );
}
